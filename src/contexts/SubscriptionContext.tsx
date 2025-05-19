import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

interface Subscription {
  plan: string;
  tokens: number;
  startDate: string;
  endDate: string;
  active: boolean;
  hasExtended?: boolean;
  planId?: string; // Add planId to track different subscriptions
}

interface SubscriptionContextProps {
  subscription: Subscription | null;
  tokens: number;
  loading: boolean;
  canPlaceOrder: boolean;
  useToken: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  updateSubscription: (newPlan: string, newTokens: number, planId: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextProps | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tokens, setTokens] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // Check if user can place an order (has tokens and subscription is active)
  const canPlaceOrder = tokens > 0 && subscription?.active === true;

  // Update subscription with new plan and tokens
  const updateSubscription = async (newPlan: string, newTokens: number, planId: string) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentSubscription = userData.subscription;
        
        // If there's an existing subscription with a different planId
        if (currentSubscription && currentSubscription.planId !== planId) {
          // Calculate the difference in tokens
          const tokenDifference = newTokens - currentSubscription.tokens;
          
          // Update the subscription with new plan details
          await updateDoc(userRef, {
            subscription: {
              plan: newPlan,
              tokens: newTokens,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              active: true,
              planId: planId
            },
            // Update total tokens by adding the difference
            tokens: Math.max(0, (userData.tokens || 0) + tokenDifference)
          });

          // Update local state
          setSubscription({
            plan: newPlan,
            tokens: newTokens,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            planId: planId
          });
          setTokens(Math.max(0, (userData.tokens || 0) + tokenDifference));

          toast({
            title: "Subscription Updated",
            description: `Your subscription has been updated to ${newPlan}. Tokens have been adjusted accordingly.`,
          });
        } else {
          // New subscription or same plan
          await updateDoc(userRef, {
            subscription: {
              plan: newPlan,
              tokens: newTokens,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              active: true,
              planId: planId
            },
            tokens: newTokens
          });

          // Update local state
          setSubscription({
            plan: newPlan,
            tokens: newTokens,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            active: true,
            planId: planId
          });
          setTokens(newTokens);

          toast({
            title: "Subscription Created",
            description: `You have subscribed to ${newPlan}. ${newTokens} tokens have been added to your account.`,
          });
        }
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Use a token for an order
  const useToken = async (): Promise<boolean> => {
    if (!currentUser || tokens <= 0 || !subscription?.active) {
      return false;
    }

    try {
      const newTokenCount = tokens - 1;
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { tokens: newTokenCount });
      setTokens(newTokenCount);
      
      toast({
        title: "Token used",
        description: `You have ${newTokenCount} tokens remaining.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error using token:", error);
      toast({
        title: "Error",
        description: "Failed to use token. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Refresh subscription data
  const refreshSubscription = async () => {
    if (!currentUser || !currentUser.uid) {
      setSubscription(null);
      setTokens(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        
        if (userData.subscription) {
          // Check if subscription is still active
          const endDate = new Date(userData.subscription.endDate);
          const now = new Date();
          
          if (endDate < now && userData.subscription.active) {
            // Subscription has expired, update it
            await updateDoc(userRef, {
              "subscription.active": false
            });
            userData.subscription.active = false;
            
            toast({
              title: "Subscription expired",
              description: "Your subscription has expired. Please renew to continue ordering meals.",
              variant: "destructive",
            });
          }
          
          setSubscription(userData.subscription);
          setTokens(userData.tokens || 0);
        } else {
          setSubscription(null);
          setTokens(userData.tokens || 0);
        }
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          tokens: 0,
          createdAt: new Date().toISOString(),
        });
        
        setSubscription(null);
        setTokens(0);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load subscription data on mount and when user changes
  useEffect(() => {
    refreshSubscription();
  }, [currentUser]);

  const value = {
    subscription,
    tokens,
    loading,
    canPlaceOrder,
    useToken,
    refreshSubscription,
    updateSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
