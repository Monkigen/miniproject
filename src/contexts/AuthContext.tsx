import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface UserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: string;
  role?: "user" | "admin" | "delivery";
  tokens?: number;
}

interface AuthContextProps {
  currentUser: (FirebaseUser & Partial<UserData>) | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (otp: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isDeliveryPartner: boolean;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<(FirebaseUser & Partial<UserData>) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDeliveryPartner, setIsDeliveryPartner] = useState(false);
  const auth = getAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ ...user, ...userData });
          setIsAdmin(userData.role === "admin");
          setIsDeliveryPartner(userData.role === "delivery");
          
          // Redirect based on role
          if (userData.role === "admin") {
            navigate("/admin");
          } else if (userData.role === "delivery") {
            navigate("/delivery");
          }
        } else {
      setCurrentUser(user);
          setIsAdmin(false);
          setIsDeliveryPartner(false);
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setIsDeliveryPartner(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, navigate]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          tokens: 0,
          role: "user",
          createdAt: new Date().toISOString()
        });
        setIsAdmin(false);
      } else {
        const userData = userDoc.data();
        setIsAdmin(userData.role === "admin");
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      return result.user;
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "There was an error signing in with Google.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is admin
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({ ...result.user, ...userData });
        setIsAdmin(userData.role === "admin");
      } else {
        setCurrentUser(result.user);
        setIsAdmin(false);
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      return result.user;
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "There was an error signing in.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name,
        email,
        photoURL: null,
        tokens: 0,
        role: "user",
        createdAt: new Date().toISOString()
      });
      
      toast({
        title: "Account created!",
        description: "Your account has been successfully created.",
      });
      return result.user;
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "There was an error creating your account.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      toast({
        title: "Password Reset Error",
        description: error.message || "There was an error resetting your password.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const confirmResetPassword = async (otp: string, newPassword: string) => {
    try {
      await confirmPasswordReset(auth, otp, newPassword);
    } catch (error: any) {
      toast({
        title: "Password Reset Confirmation Error",
        description: error.message || "There was an error confirming your password reset.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message || "There was an error signing out.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    confirmResetPassword,
    signOut,
    isAdmin,
    isDeliveryPartner
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
