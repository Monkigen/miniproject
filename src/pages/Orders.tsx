import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Receipt, 
  ShoppingBag, 
  ClipboardList, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  ChefHat, 
  Timer,
  Filter,
  ArrowUpDown,
  Calendar,
  RefreshCw,
  AlertCircle,
  QrCode,
  X
} from "lucide-react";
import { collection, query, where, onSnapshot, orderBy, getDocs, Unsubscribe, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OrderQRCode from "@/components/OrderQRCode";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface DeliveryDetails {
  status: string;
  estimatedTime?: string;
  deliveredAt?: string;
  deliveryPerson?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  trackingStatus: string;
  createdAt: any;
  deliveryDetails?: DeliveryDetails;
  userDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface QRCodeData {
  type: string;
  orderId: string;
  timestamp: number;
  orderDetails: {
    items: Array<{
      name: string;
      quantity: number;
    }>;
    total: number;
    status: string;
    createdAt: string | null;
  };
  userDetails: {
    name?: string;
    email?: string;
    phone?: string;
  };
  verificationCode: string;
}

const formatDate = (timestamp: any) => {
  if (!timestamp) return "N/A";
  
  // Handle Firestore Timestamp
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  
  // Handle string dates
  if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleString();
  }
  
  // Handle Date objects
  if (timestamp instanceof Date) {
    return timestamp.toLocaleString();
  }
  
  return "Invalid Date";
};

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { useToken } = useSubscription();

  // Handle filter changes with loading state
  const handleFilterChange = (newFilter: string) => {
    setFilterLoading(true);
    setFilter(newFilter);
    // Simulate a small delay to show loading state
    setTimeout(() => setFilterLoading(false), 300);
  };

  // Handle sort changes with loading state
  const handleSortChange = (newSort: string) => {
    setFilterLoading(true);
    setSortBy(newSort);
    // Simulate a small delay to show loading state
    setTimeout(() => setFilterLoading(false), 300);
  };

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    const setupOrdersListener = async () => {
      if (!currentUser) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Create a simpler query that doesn't require a composite index
        const ordersQuery = query(
          collection(db, "orders"),
          where("userId", "==", currentUser.uid)
        );

        // Set up the real-time listener
        unsubscribe = onSnapshot(
          ordersQuery,
          (snapshot) => {
            try {
              const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Order[];
              
              // Sort the data in memory instead of in the query
              const sortedOrders = ordersData.sort((a, b) => {
                const dateA = new Date(a.createdAt.seconds * 1000).getTime();
                const dateB = new Date(b.createdAt.seconds * 1000).getTime();
                return sortBy === "newest" ? dateB - dateA : dateA - dateB;
              });
              
              setOrders(sortedOrders);
              setError(null);
            } catch (error) {
              console.error("Error processing orders data:", error);
              setError("Failed to process orders data");
              toast({
                title: "Error",
                description: "Failed to process orders data. Please refresh the page.",
                variant: "destructive",
              });
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error("Error in orders listener:", error);
            setError("Failed to fetch orders");
            toast({
              title: "Error",
              description: "Failed to fetch orders. Please try again later.",
              variant: "destructive",
            });
            setLoading(false);
        }
        );
      } catch (error) {
        console.error("Error setting up orders listener:", error);
        setError("Failed to set up orders listener");
        toast({
          title: "Error",
          description: "Failed to set up orders listener. Please refresh the page.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    setupOrdersListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, toast, sortBy]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // The useEffect will automatically retry when loading state changes
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "preparing":
        return "bg-blue-500";
      case "ready":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTrackingStatus = (order: Order) => {
    const steps = [
      { 
        id: "order_placed", 
        label: "Order Placed", 
        icon: Receipt,
        completed: true,
        description: "Your order has been received"
      },
      { 
        id: "preparing", 
        label: "Preparing", 
        icon: ChefHat,
        completed: order.trackingStatus !== "order_placed",
        description: "Your meal is being prepared"
      },
      { 
        id: "ready", 
        label: "Ready for Pickup", 
        icon: Package,
        completed: order.trackingStatus === "ready" || order.trackingStatus === "delivered",
        description: "Your meal is ready for pickup"
      },
      { 
        id: "delivered", 
        label: "Delivered", 
        icon: CheckCircle2,
        completed: order.trackingStatus === "delivered",
        description: "Your meal has been delivered"
      }
    ];

    return steps;
  };

  const getEstimatedTime = (order: Order) => {
    const orderTime = new Date(order.createdAt.seconds * 1000);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (order.trackingStatus === "delivered") {
      return "Delivered";
    }
    
    if (diffMinutes < 15) {
      return "Estimated delivery in 15-20 minutes";
    } else if (diffMinutes < 30) {
      return "Estimated delivery in 5-10 minutes";
    } else {
      return "Delivery in progress";
    }
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrder(selectedOrder === orderId ? null : orderId);
  };

  const handleShowQRCode = (orderId: string) => {
    setShowQRCode(orderId);
  };

  const handleCloseQRCode = () => {
    setShowQRCode(null);
  };

  const filteredAndSortedOrders = React.useMemo(() => {
    return orders
      .filter(order => {
        if (!order || !order.trackingStatus) return false;
        if (filter === "all") return true;
        if (filter === "active") return order.trackingStatus !== "delivered";
        if (filter === "delivered") return order.trackingStatus === "delivered";
        return true;
      })
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        const dateA = new Date(a.createdAt.seconds * 1000).getTime();
        const dateB = new Date(b.createdAt.seconds * 1000).getTime();
        return sortBy === "newest" ? dateB - dateA : dateA - dateB;
      });
  }, [orders, filter, sortBy]);

  const generateQRCodeData = (order: Order): string => {
    const qrData: QRCodeData = {
      type: "campus-bite-order",
      orderId: order.id,
      timestamp: Date.now(),
      orderDetails: {
        items: order.items.map(item => ({
          name: item.name,
          quantity: item.quantity
        })),
        total: order.total,
        status: order.trackingStatus,
        createdAt: order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toISOString() : null
      },
      userDetails: order.userDetails || {},
      verificationCode: order.id.slice(-6).toUpperCase()
    };
    return JSON.stringify(qrData);
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="mb-6">Please sign in to view your order history.</p>
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Error Loading Orders</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <p className="mb-6">{error}</p>
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <div className="flex gap-4">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]" disabled={filterLoading}>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="active">Active Orders</SelectItem>
              <SelectItem value="delivered">Delivered Orders</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]" disabled={filterLoading}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading || filterLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Separator />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-gray-600 mb-4">
              {filter === "all" 
                ? "Start ordering some delicious meals"
                : filter === "active"
                ? "You have no active orders"
                : "You have no delivered orders"}
            </p>
            <Button asChild>
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Order #{order.id.slice(-8)}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.trackingStatus)}>
                    {order.trackingStatus.charAt(0).toUpperCase() + order.trackingStatus.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedOrder === order.id && (
                    <>
                      <div className="space-y-4">
                        {getTrackingStatus(order).map((step, index) => (
                          <div key={step.id} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`}>
                              <step.icon className={`h-4 w-4 ${step.completed ? 'text-white' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {step.label}
                                </span>
                                {step.completed && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{step.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                  <Separator />
                    </>
                  )}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="text-gray-600">Free</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ordered on</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  {order.deliveryDetails?.deliveredAt && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivered on</span>
                      <span>{formatDate(order.deliveryDetails.deliveredAt)}</span>
                    </div>
                  )}
                  {order.trackingStatus !== "delivered" && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Timer className="h-4 w-4" />
                      <span>{getEstimatedTime(order)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              {order.trackingStatus !== "delivered" && (
                <CardFooter className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => handleTrackOrder(order.id)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {selectedOrder === order.id ? "Hide Details" : "Track Order"}
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleShowQRCode(order.id)}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Show QR Code
                </Button>
              </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {showQRCode && (
        <OrderQRCode
          order={orders.find(o => o.id === showQRCode)!}
          onClose={handleCloseQRCode}
        />
      )}
    </div>
  );
};

export default Orders;
