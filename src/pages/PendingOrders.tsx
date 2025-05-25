import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldAlert, Package, Calendar, Clock, ArrowLeft, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, orderBy, Timestamp, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: any[];
  createdAt: any;
  deliveryDetails: {
    phone?: string;
    location?: string;
    status?: string;
  };
  status: string;
}

const PendingOrders = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Create query for undelivered orders
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("status", "in", ["pending", "order_placed"]),
        orderBy("createdAt", "desc")
      );

      // Get the documents
      const querySnapshot = await getDocs(q);
      
      // Process the documents with proper error handling
      const fetchedOrders = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orderNumber: data.orderNumber || `ORD-${doc.id.slice(-6)}`,
          customerName: data.userDetails?.name || 'Unknown',
          customerEmail: data.userDetails?.email || 'No email',
          items: data.items || [],
          createdAt: data.createdAt,
          deliveryDetails: data.deliveryDetails || {},
          status: data.status || 'pending'
        } as Order;
      });

      console.log("Fetched orders:", fetchedOrders);
      setOrders(fetchedOrders);

    } catch (error: any) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to fetch orders");
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("status", "in", ["pending", "order_placed"]),
      orderBy("createdAt", "desc")
    );

    const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orderNumber: data.orderNumber || `ORD-${doc.id.slice(-6)}`,
          customerName: data.userDetails?.name || 'Unknown',
          customerEmail: data.userDetails?.email || 'No email',
          items: data.items || [],
          createdAt: data.createdAt,
          deliveryDetails: data.deliveryDetails || {},
          status: data.status || 'pending'
        } as Order;
      });

      console.log("Real-time update: Fetched orders:", fetchedOrders);
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching real-time orders:", error);
      setError(error.message || "Failed to fetch real-time orders");
      setLoading(false);
      toast({
        title: "Error",
        description: "Failed to fetch real-time updates for pending orders.",
        variant: "destructive",
      });
    });

    return () => unsubscribe();

  }, [toast]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
            <p className="mb-6">Please sign in to access the pending orders.</p>
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
            <p className="mb-6">You don't have permission to access the pending orders.</p>
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
      <div className="flex items-center mb-6">
        <Link to="/delivery" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Pending Orders</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending Deliveries</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-green mx-auto mb-4" />
              <p>Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <ShieldAlert className="h-12 w-12 mx-auto mb-4" />
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4" />
              <p>No pending orders available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">#{order.orderNumber || order.id.slice(-6)}</p>
                        <span className={`text-xs px-2 py-1 rounded ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                          {order.status === 'pending' ? 'Pending' : 'Order Placed'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.customerEmail}
                        </p>
                        <p className="text-xs text-gray-500">
                          📞 {order.deliveryDetails.phone || 'No phone number'}
                        </p>
                        <p className="text-xs text-gray-500">
                          📍 {order.deliveryDetails.location || 'No location specified'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {order.createdAt?.toDate?.()?.toLocaleDateString()}
                          </span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>
                            {order.createdAt?.toDate?.()?.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600">
                        {order.items?.length || 0} Items
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
  );
};

export default PendingOrders; 