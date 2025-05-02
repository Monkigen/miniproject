import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ShoppingBag,
  Package,
  Clock,
  AlertCircle,
  RefreshCw,
  Calendar,
  Filter,
  ArrowUpDown,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { collection, query, where, onSnapshot, orderBy, getDocs, Unsubscribe, Timestamp, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: any;
  lastLogin?: any;
}

interface Order {
  id: string;
  userId: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  total: number;
  status: string;
  trackingStatus: string;
  createdAt: any;
  userDetails?: {
    name: string;
    email: string;
  };
}

interface Activity {
  id: string;
  userId: string;
  type: string;
  details: string;
  timestamp: any;
  userDetails?: {
    name: string;
    email: string;
  };
}

const Admin = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // First effect: Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!currentUser) {
        navigate("/auth");
        return;
      }

      try {
        const userDoc = await getDocs(query(
          collection(db, "users"),
          where("email", "==", currentUser.email)
        ));

        if (userDoc.empty) {
          await addDoc(collection(db, "users"), {
            id: currentUser.uid,
            email: currentUser.email,
            role: "admin",
            createdAt: serverTimestamp(),
            name: currentUser.displayName || "Admin User"
          });
        } else {
          const userData = userDoc.docs[0].data();
          if (userData.role !== "admin") {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access this page.",
              variant: "destructive",
            });
            navigate("/");
            return;
          }
        }
        setInitializing(false);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setError("Failed to verify admin access");
        setInitializing(false);
      }
    };

    checkAdminAccess();
  }, [currentUser, navigate, toast]);

  // Second effect: Set up data listeners only after admin access is verified
  useEffect(() => {
    if (initializing) return;

    let unsubscribeUsers: Unsubscribe | undefined;
    let unsubscribeOrders: Unsubscribe | undefined;
    let unsubscribeActivities: Unsubscribe | undefined;

    const setupListeners = async () => {
      try {
        setLoading(true);
        setError(null);

        // Users listener
        unsubscribeUsers = onSnapshot(
          collection(db, "users"),
          (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              role: doc.data().role || "user"
            })) as User[];
            setUsers(usersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching users:", error);
            setError("Failed to fetch users");
            setLoading(false);
          }
        );

        // Orders listener
        unsubscribeOrders = onSnapshot(
          collection(db, "orders"),
          (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Order[];
            setOrders(ordersData);
          },
          (error) => {
            console.error("Error fetching orders:", error);
            setError("Failed to fetch orders");
          }
        );

        // Activities listener
        unsubscribeActivities = onSnapshot(
          collection(db, "activities"),
          (snapshot) => {
            const activitiesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Activity[];
            setActivities(activitiesData);
          },
          (error) => {
            console.error("Error fetching activities:", error);
            setError("Failed to fetch activities");
          }
        );
      } catch (error) {
        console.error("Error setting up listeners:", error);
        setError("Failed to set up data listeners");
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeActivities) unsubscribeActivities();
    };
  }, [initializing]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    if (timestamp?.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString();
    }
    
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }
    
    return "Invalid Date";
  };

  const formatPrice = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "N/A";
    return `$${amount.toFixed(2)}`;
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filterDate = (timestamp: any) => {
      if (!timestamp) return false;
      const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      
      switch (filter) {
        case "today":
          return date.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          return date >= weekAgo;
        case "month":
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          return date >= monthAgo;
        default:
          return true;
      }
    };

    const sortData = (a: any, b: any) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : new Date(b.createdAt);
      return sortBy === "newest" ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    };

    const searchData = (item: any) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.id?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        item.name?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.details?.toLowerCase().includes(query)
      );
    };

    return {
      users: users.filter(searchData).sort(sortData),
      orders: orders.filter(order => filterDate(order.createdAt) && searchData(order)).sort(sortData),
      activities: activities.filter(activity => filterDate(activity.timestamp) && searchData(activity)).sort(sortData),
    };
  }, [users, orders, activities, filter, sortBy, searchQuery]);

  if (initializing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-[50vh]">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="ml-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px] mt-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Error Loading Data</CardTitle>
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
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({filteredAndSortedData.users.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({filteredAndSortedData.orders.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({filteredAndSortedData.activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{filteredAndSortedData.users.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{filteredAndSortedData.orders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{filteredAndSortedData.activities.length}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredAndSortedData.users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedData.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name || "No Name"}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role || "user"}
                        </Badge>
                        <p className="text-sm text-gray-500">
                          Joined: {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredAndSortedData.orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedData.orders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(-8)}</p>
                          <p className="text-sm text-gray-500">
                            {order.userDetails?.name || "Unknown User"}
                          </p>
                        </div>
                        <Badge>{order.trackingStatus || "Pending"}</Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Items: {order.items?.length || 0}</p>
                        <p>Total: {formatPrice(order.total)}</p>
                        <p>Created: {formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredAndSortedData.activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No activities found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedData.activities.map((activity) => (
                    <div key={activity.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{activity.type}</p>
                          <p className="text-sm text-gray-500">
                            {activity.userDetails?.name || "Unknown User"}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                      <p className="text-sm">{activity.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin; 