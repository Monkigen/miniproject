import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, MapPin, User, Package, RefreshCw } from "lucide-react";
import { collection, query, where, getDocs, orderBy, Timestamp, limit, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  id: string;
  orderNumber: string;
  userDetails: {
    name: string;
    email: string;
  };
  deliveryDetails: {
    phone?: string;
    location?: string;
    deliveryPerson?: string;
    deliveredAt?: Timestamp;
  };
  items: any[];
  createdAt: Timestamp;
  status: string;
}

const CompletedDeliveries = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const isFetching = useRef(false);
  const mounted = useRef(true);

  const ORDERS_PER_PAGE = 20; // Or your preferred page size

  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isFetching.current || !mounted.current) return;

    try {
      isFetching.current = true;
      if (isInitial) setLoading(true);

      const ordersRef = collection(db, "orders");

      let q = query(
        ordersRef,
        where("status", "==", "completed"),
        orderBy("createdAt", "desc"),
        limit(ORDERS_PER_PAGE)
      );

      if (!isInitial && lastVisible) {
        q = query(
          ordersRef,
          where("status", "==", "completed"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(ORDERS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);

      if (!mounted.current) return;

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);

      setHasMore(querySnapshot.docs.length === ORDERS_PER_PAGE);

      const newOrders = querySnapshot.docs.map(doc => {
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

      if (isInitial) {
        setOrders(newOrders);
      } else {
        setOrders(prevOrders => [...prevOrders, ...newOrders]);
      }

    } catch (err: any) {
      if (!mounted.current) return;
      console.error("Error fetching completed orders:", err);
      setError(err.message || "Failed to fetch orders");
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
  }, [lastVisible, toast]);

  const loadMoreOrders = useCallback(() => {
    if (!loading && hasMore && !isFetching.current) {
      fetchOrders(false);
    }
  }, [loading, hasMore, fetchOrders]);

  const handleRefresh = useCallback(() => {
    setOrders([]); // Clear existing orders
    setLastVisible(null); // Reset pagination
    setHasMore(true);
    fetchOrders(true); // Fetch the first page again
  }, [fetchOrders]);

  useEffect(() => {
    mounted.current = true;
    fetchOrders(true); // Initial fetch

    return () => {
      mounted.current = false;
      isFetching.current = false;
    };
  }, [fetchOrders]);

  // Memoize the order cards
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
                Delivered by: {order.deliveryDetails?.deliveryPerson || 'Unknown'}
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
        {/* Fixed Scanner Section - Keep for layout */}
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl">Completed Deliveries</CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={loading}
                className={loading ? "animate-spin-slow" : ""} // Optional: Add spin animation
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading && orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-green mx-auto mb-4" />
                  <p>Loading orders...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleRefresh} // Use handleRefresh on error as well
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

                  {/* Loading indicator for loading more */}
                  {loading && orders.length > 0 && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-campus-green mx-auto" />
                    </div>
                  )}

                  {/* Load More Button */}
                  {hasMore && !loading && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={loadMoreOrders}
                        className="w-full"
                      >
                        Load More
                      </Button>
                    </div>
                  )}
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