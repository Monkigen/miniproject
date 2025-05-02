import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldAlert, PackageCheck } from "lucide-react";
import FileDeliveryScanner from "@/components/FileDeliveryScanner";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";

const Delivery = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const { useToken } = useSubscription();
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      if (!currentUser) return;
      
      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("deliveryDetails.status", "==", "delivered"),
          where("deliveryDetails.deliveryPartnerId", "==", currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCompletedOrders(orders);
      } catch (error) {
        console.error("Error fetching completed orders:", error);
        toast({
          title: "Error",
          description: "Failed to fetch completed orders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, [currentUser, toast]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
            <p className="mb-6">Please sign in to access the delivery portal.</p>
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

  // Check if user has delivery role
  const hasDeliveryRole = currentUser.role === "delivery";

  if (!hasDeliveryRole) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Unauthorized Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
            <p className="mb-6">You don't have permission to access the delivery portal.</p>
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
        tokens: increment(-1)
      });

      // Use token from subscription context
      const tokenUsed = await useToken();
      if (!tokenUsed) {
        throw new Error("Failed to deduct token");
      }

      toast({
        title: "Delivery Confirmed",
        description: "One token has been deducted from the user's account.",
      });

      // Refresh completed orders
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("deliveryDetails.status", "==", "delivered"),
        where("deliveryDetails.deliveryPartnerId", "==", currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCompletedOrders(orders);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Scan Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            {scanning ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-green mx-auto mb-4" />
                <p>Processing delivery...</p>
              </div>
            ) : (
              <FileDeliveryScanner onScanSuccess={handleScanSuccess} />
            )}
          </CardContent>
        </Card>

        {/* Completed Orders Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Completed Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-green mx-auto mb-4" />
                <p>Loading orders...</p>
              </div>
            ) : completedOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PackageCheck className="h-12 w-12 mx-auto mb-4" />
                <p>No completed deliveries yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedOrders.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-6)}</p>
                        <p className="text-sm text-gray-500">
                          Delivered: {new Date(order.deliveryDetails.deliveredAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${order.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{order.items.length} items</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Delivery; 