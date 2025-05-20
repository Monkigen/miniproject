import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, MapPin, User, Package } from "lucide-react";
import { collection, query, where, getDocs, orderBy, Timestamp, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useOptimizedFetch } from "@/hooks/useOptimizedFetch";

interface Order {
  id: string;
  orderNumber: string;
  userDetails: {
    name: string;
    email: string;
  };
  deliveryDetails: {
    phone: string;
    location: string;
    deliveryPerson: string;
    deliveredAt: Timestamp;
  };
  items: any[];
  createdAt: Timestamp;
  status: string;
}

const CompletedDeliveries = () => {
  const { toast } = useToast();

  const fetchOrders = async () => {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("status", "==", "completed"),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        orderNumber: data.orderNumber || `ORD-${doc.id.slice(-6)}`,
        userDetails: {
          name: data.userDetails?.name || 'Unknown Customer',
          email: data.userDetails?.email || 'No email'
        },
        deliveryDetails: {
          phone: data.deliveryDetails?.phone || 'No phone number',
          location: data.deliveryDetails?.location || 'No location',
          deliveryPerson: data.deliveryDetails?.deliveryPerson || 'Unknown',
          deliveredAt: data.deliveryDetails?.deliveredAt || data.createdAt
        },
        items: data.items || [],
        createdAt: data.createdAt,
        status: data.status
      } as Order;
    });
  };

  const { data: orders, loading, error } = useOptimizedFetch<Order[]>(fetchOrders, {
    cacheKey: 'completed-orders',
    cacheDuration: 30000 // 30 seconds
  });

  // Memoize the order cards to prevent unnecessary re-renders
  const renderOrderCards = React.useMemo(() => {
    if (!orders) return null;
    
    return orders.map((order) => (
      <Card key={order.id} className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">#{order.orderNumber}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{order.userDetails.name}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  📞 {order.deliveryDetails.phone}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{order.deliveryDetails.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {order.deliveryDetails.deliveredAt?.toDate?.()?.toLocaleDateString() || 'No date'} {' '}
                  {order.deliveryDetails.deliveredAt?.toDate?.()?.toLocaleTimeString() || 'No time'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Delivered by: {order.deliveryDetails.deliveryPerson}
              </div>
              <div className="text-xs text-gray-500">
                {order.items?.length || 0} Items
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ));
  }, [orders]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Fixed Scanner Section */}
        <div className="w-1/3 sticky top-4 h-[calc(100vh-2rem)]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Scanner</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[calc(100%-4rem)]">
              <div className="text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4" />
                <p>Scanner will be available here</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scrollable Orders Section */}
        <div className="w-2/3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Completed Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4" />
                  <p>Loading orders...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4" />
                  <p>No completed orders found</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
                  {renderOrderCards}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompletedDeliveries; 