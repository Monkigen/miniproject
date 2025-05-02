import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import FileDeliveryScanner from "@/components/FileDeliveryScanner";
import { ShieldAlert, AlertCircle } from "lucide-react";
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";

const Scanner = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const { useToken } = useSubscription();

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
            <p className="mb-6">Please sign in to access the scanner.</p>
            <Link to="/auth">
              <Button className="bg-campus-green hover:bg-campus-green/90">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has scanner role
  const hasScannerRole = currentUser.role === "delivery";

  if (!hasScannerRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Unauthorized Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
            <p className="mb-6">You don't have permission to access the scanner.</p>
            <Link to="/">
              <Button variant="outline">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleScanSuccess = async (userId: string) => {
    try {
      setScanning(true);
      
      // Get user document
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      
      // Check if user has enough tokens
      if (!userData.tokens || userData.tokens < 1) {
        toast({
          title: "Insufficient Tokens",
          description: "The user doesn't have enough tokens for this delivery.",
          variant: "destructive",
        });
        return;
      }

      // Deduct one token
      await updateDoc(userRef, {
        tokens: increment(0)
      });

      // Use token from subscription context
      const tokenUsed = await useToken();
      if (!tokenUsed) {
        throw new Error("Failed to deduct token");
      }

      // Update order status
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("userId", "==", userId),
        where("deliveryDetails.status", "!=", "delivered")
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "orders", orderDoc.id), {
          "deliveryDetails.status": "delivered",
          "deliveryDetails.deliveredAt": new Date().toISOString(),
          "deliveryDetails.deliveryPartnerId": currentUser.uid,
          "trackingStatus": "delivered"
        });
      }

      toast({
        title: "Delivery Confirmed",
        description: "One token has been deducted from the user's account.",
      });
    } catch (error: any) {
      console.error("Error processing delivery:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process delivery",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Delivery Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          {scanning ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-8 w-8 animate-spin text-campus-green mb-4" />
              <p>Processing delivery...</p>
            </div>
          ) : (
            <FileDeliveryScanner onScanSuccess={handleScanSuccess} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Scanner; 