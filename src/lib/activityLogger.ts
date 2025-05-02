import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

interface ActivityLog {
  userId: string;
  type: string;
  details: string;
  userDetails?: {
    name?: string;
    email?: string;
  };
  metadata?: {
    [key: string]: any;
  };
}

export const logActivity = async (activity: ActivityLog) => {
  try {
    // Get user details if not provided
    if (!activity.userDetails) {
      const userDoc = await getDoc(doc(db, "users", activity.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        activity.userDetails = {
          name: userData.name,
          email: userData.email,
        };
      }
    }

    // Add timestamp and additional metadata
    const activityData = {
      ...activity,
      timestamp: serverTimestamp(),
      metadata: {
        ...activity.metadata,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString(),
      },
    };

    await addDoc(collection(db, "activities"), activityData);
  } catch (error) {
    console.error("Error logging activity:", error);
    // You might want to implement a retry mechanism or error reporting here
  }
};

// Common activity types
export const ActivityTypes = {
  // Authentication
  LOGIN: "User Login",
  LOGOUT: "User Logout",
  SIGNUP: "User Signup",
  PASSWORD_RESET: "Password Reset",
  
  // Orders
  ORDER_PLACED: "Order Placed",
  ORDER_UPDATED: "Order Updated",
  ORDER_DELIVERED: "Order Delivered",
  ORDER_CANCELLED: "Order Cancelled",
  
  // Subscriptions
  SUBSCRIPTION_PURCHASED: "Subscription Purchased",
  SUBSCRIPTION_UPDATED: "Subscription Updated",
  SUBSCRIPTION_CANCELLED: "Subscription Cancelled",
  
  // Tokens
  TOKENS_ADDED: "Tokens Added",
  TOKENS_USED: "Tokens Used",
  TOKENS_EXPIRED: "Tokens Expired",
  
  // Profile
  PROFILE_UPDATED: "Profile Updated",
  PROFILE_DELETED: "Profile Deleted",
  
  // Admin
  ADMIN_ACTION: "Admin Action",
  USER_MANAGED: "User Managed",
  ORDER_MANAGED: "Order Managed",
  SYSTEM_SETTINGS_UPDATED: "System Settings Updated",
  
  // Error
  ERROR_OCCURRED: "Error Occurred",
} as const;

// Helper function to create activity details
export const createActivityDetails = {
  orderPlaced: (orderId: string, total: number) => 
    `Order #${orderId.slice(-8)} placed with total $${total.toFixed(2)}`,
  
  orderUpdated: (orderId: string, status: string) => 
    `Order #${orderId.slice(-8)} status updated to ${status}`,
  
  subscriptionPurchased: (planId: string, duration: string) => 
    `Subscription purchased: ${planId} for ${duration}`,
  
  tokensAdded: (amount: number, reason: string) => 
    `${amount} tokens added: ${reason}`,
  
  tokensUsed: (amount: number, purpose: string) => 
    `${amount} tokens used for ${purpose}`,
  
  adminAction: (action: string, target: string) => 
    `Admin performed ${action} on ${target}`,
  
  error: (error: Error, context: string) => 
    `Error in ${context}: ${error.message}`,
} as const; 