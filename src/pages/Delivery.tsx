import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldAlert, PackageCheck, Calendar, Clock, RefreshCw } from "lucide-react";
import FileDeliveryScanner from "@/components/FileDeliveryScanner";
import DeliveryScanner from "@/components/DeliveryScanner";
import { useState, useEffect, useCallback, useRef } from "react";
import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, orderBy, Timestamp, limit, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";

// Define the order type
interface Order {
  id: string;
  deliveryDetails?: {
    status?: string;
    deliveredAt?: Timestamp;
    deliveryPartnerId?: string;
    deliveryPartnerName?: string;
    deliveryPartnerEmail?: string;
  };
  tokensDeducted?: number;
  total?: number;
  items?: any[];
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  orderNumber?: string;
  createdAt?: Timestamp;
}

const Delivery = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const { useToken } = useSubscription();
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const ORDERS_PER_PAGE = 10;
  const isFetching = useRef(false);
  const mounted = useRef(true);
  const [scannerMethod, setScannerMethod] = useState<'file' | 'camera'>('file');

  const fetchCompletedOrders = useCallback(async (isInitial = false) => {
    if (!currentUser || isFetching.current || !mounted.current) return;
    
    try {
      isFetching.current = true;
      setLoading(true);
      const ordersRef = collection(db, "orders");
      
      // Query for delivered orders
      let q = query(
        ordersRef,
        where("deliveryDetails.status", "==", "delivered"),
        orderBy("deliveryDetails.deliveredAt", "desc"),
        limit(ORDERS_PER_PAGE)
      );

      // If not initial load and we have a last visible document, start after it
      if (!isInitial && lastVisible) {
        q = query(
          ordersRef,
          where("deliveryDetails.status", "==", "delivered"),
          orderBy("deliveryDetails.deliveredAt", "desc"),
          startAfter(lastVisible),
          limit(ORDERS_PER_PAGE)
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      if (!mounted.current) return;

      // Update last visible document
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      
      // Check if there are more documents
      setHasMore(querySnapshot.docs.length === ORDERS_PER_PAGE);
      
      // Map the documents to orders
      const newOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      
      if (newOrders.length > 0) {
        console.log("Fetched new orders:", newOrders);
        
        // Update completed orders
        if (isInitial) {
          setCompletedOrders(newOrders);
        } else {
          setCompletedOrders(prev => {
            // Combine previous and new orders, removing duplicates
            const combined = [...prev, ...newOrders];
            const uniqueOrders = Array.from(
              new Map(combined.map(order => [order.id, order])).values()
            );
            return uniqueOrders;
          });
        }
      } else if (isInitial) {
        setCompletedOrders([]);
      }
    } catch (error: any) {
      if (!mounted.current) return;
      
      console.error("Error fetching completed orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch completed orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (mounted.current) {
        setLoading(false);
        isFetching.current = false;
      }
    }
  }, [currentUser, toast, lastVisible]);

  // Load more orders
  const loadMoreOrders = useCallback(() => {
    if (!loading && hasMore && !isFetching.current) {
      fetchCompletedOrders(false);
    }
  }, [loading, hasMore, fetchCompletedOrders]);

  useEffect(() => {
    mounted.current = true;
    
    // Reset state when component mounts
    setCompletedOrders([]);
    setLastVisible(null);
    setHasMore(true);
    fetchCompletedOrders(true);

    return () => {
      mounted.current = false;
      isFetching.current = false;
    };
  }, [currentUser?.uid]);

  const handleScanSuccess = async (userId: string) => {
    try {
      setScanning(true);
      
      // Get user document
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        });
        return;
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

      // Find the user's active order - Simplified query
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("userId", "==", userId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      const activeOrders = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order))
        .filter(order => order.deliveryDetails?.status !== "delivered");

      if (activeOrders.length === 0) {
        toast({
          title: "No Active Order",
          description: "No active order found for this user.",
          variant: "destructive",
        });
        return;
      }

      const orderDoc = querySnapshot.docs[0];
      const orderData = orderDoc.data();

      // Calculate total quantity
      const totalQuantity = orderData.items.reduce((sum: number, item: any) => sum + item.quantity, 0);

      // Deduct tokens
      await updateDoc(userRef, {
        tokens: increment(-totalQuantity)
      });

      const now = Timestamp.now();

      // Update order status with more detailed information
      const updatedOrderData = {
        "deliveryDetails": {
          status: "delivered",
          deliveredAt: now,
          deliveryPartnerId: currentUser.uid,
          deliveryPartnerName: currentUser.displayName || "Unknown",
          deliveryPartnerEmail: currentUser.email
        },
        "trackingStatus": "delivered",
        "tokenDeducted": true,
        "tokensDeducted": totalQuantity,
        "deliveryCompletedAt": now,
        "lastUpdated": now,
        "customerName": userData.displayName || "Unknown",
        "customerEmail": userData.email,
        "orderNumber": `ORD-${orderDoc.id.slice(-6).toUpperCase()}`,
        "createdAt": orderData.createdAt || now
      };

      // Update the order in Firestore
      await updateDoc(doc(db, "orders", orderDoc.id), updatedOrderData);

      // Reset pagination state and refresh completed orders
      setLastVisible(null);
      setHasMore(true);
      await fetchCompletedOrders(true); // Refresh the completed orders list

      toast({
        title: "Success",
        description: `Order delivered and ${totalQuantity} token${totalQuantity > 1 ? 's' : ''} deducted successfully`,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Delivery Portal</h1>
        <Link to="/pending-orders">
          <Button className="bg-campus-green hover:bg-campus-green/90">
            Pending Orders
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Delivery Scanner</CardTitle>
          </CardHeader>
          <CardContent>
            {scanning ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-green mx-auto mb-4" />
                <p>Processing scan...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="flex space-x-4">
                  <Button 
                    variant={scannerMethod === 'file' ? 'default' : 'outline'}
                    onClick={() => setScannerMethod('file')}
                    className={scannerMethod === 'file' ? 'bg-campus-green hover:bg-campus-green/90' : ''}
                  >
                    Upload QR Code Image
                  </Button>
                  <Button 
                    variant={scannerMethod === 'camera' ? 'default' : 'outline'}
                    onClick={() => setScannerMethod('camera')}
                    className={scannerMethod === 'camera' ? 'bg-campus-green hover:bg-campus-green/90' : ''}
                  >
                    Scan with Camera
                  </Button>
                </div>
                
                {scannerMethod === 'file' && (
                  <FileDeliveryScanner 
                    onScanSuccess={handleScanSuccess} 
                    onOrderCompleted={() => fetchCompletedOrders(true)}
                  />
                )}

                {scannerMethod === 'camera' && (
                  <DeliveryScanner 
                    // onScanSuccess={handleScanSuccess} // Removed as it's handled internally by DeliveryScanner
                    // Note: DeliveryScanner component might need adaptation to use onOrderCompleted
                    // Assuming it calls onScanSuccess with userId upon completion
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Deliveries Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-center">Completed Deliveries</CardTitle>
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchCompletedOrders(true)} // Use fetchCompletedOrders to refresh
              disabled={loading && completedOrders.length === 0} // Disable while initially loading
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading && completedOrders.length === 0 ? (
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
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
                {completedOrders.map((order) => (
                  <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">#{order.orderNumber || order.id.slice(-6)}</p>
                          <span className="text-xs bg-campus-green/10 text-campus-green px-2 py-1 rounded">
                            {order.tokensDeducted || 0} Tokens
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            {order.customerName || 'Unknown Customer'}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {(() => {
                                const date = order.deliveryDetails?.deliveredAt;
                                if (!date) return 'N/A';
                                if (typeof date === 'string') {
                                  return new Date(date).toLocaleDateString();
                                }
                                if (date.toDate) {
                                  return date.toDate().toLocaleDateString();
                                }
                                return 'N/A';
                              })()}
                            </span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>
                              {(() => {
                                const date = order.deliveryDetails?.deliveredAt;
                                if (!date) return 'N/A';
                                if (typeof date === 'string') {
                                  return new Date(date).toLocaleTimeString();
                                }
                                if (date.toDate) {
                                  return date.toDate().toLocaleTimeString();
                                }
                                return 'N/A';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">
                          {order.items?.length || 0} Items
                        </p>
                        <p className="text-xs text-gray-500">
                          Delivered by {order.deliveryDetails?.deliveryPartnerName || 'Unknown'}
                        </p>
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