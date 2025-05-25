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
  Trash2,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { collection, query, where, onSnapshot, orderBy, getDocs, Unsubscribe, Timestamp, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import jsPDF from 'jspdf';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'user' | 'order' | 'activity', id: string } | null>(null);

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
              id: doc.id.toString(),
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

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const collectionName = itemToDelete.type === 'user' ? 'users' : 
                           itemToDelete.type === 'order' ? 'orders' : 'activities';
      
      await deleteDoc(doc(db, collectionName, itemToDelete.id));
      
      toast({
        title: "Success",
        description: `${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} deleted successfully.`,
      });
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const confirmDelete = (type: 'user' | 'order' | 'activity', id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const handleExportFoodItems = () => {
    const doc = new jsPDF();
    const itemsSummary: { [key: string]: number } = {};

    // Aggregate quantities for each food item from ALL filtered orders
    filteredAndSortedData.orders.forEach(order => {
      order.items.forEach(item => {
        if (itemsSummary[item.name]) {
          itemsSummary[item.name] += item.quantity;
        } else {
          itemsSummary[item.name] = item.quantity;
        }
      });
    });

    // Prepare data for PDF
    let yOffset = 10;
    doc.text("Food Items Summary", 10, yOffset);
    yOffset += 10;
    doc.text("--------------------", 10, yOffset);
    yOffset += 10;

    for (const itemName in itemsSummary) {
      if (itemsSummary.hasOwnProperty(itemName)) {
        doc.text(`${itemName}: ${itemsSummary[itemName]}`, 10, yOffset);
        yOffset += 7;
      }
    }

    // Save the PDF
    doc.save('food_items_summary.pdf');
  };

  const handleExportOrderPlacedFoodItems = () => {
    const doc = new jsPDF();
    const itemsSummary: { [key: string]: number } = {};

    // Filter for Order Placed orders and aggregate quantities
    const orderPlacedOrders = filteredAndSortedData.orders.filter(order => order.status === 'order_placed' || order.trackingStatus === 'order_placed');

    orderPlacedOrders.forEach(order => {
      order.items.forEach(item => {
        if (itemsSummary[item.name]) {
          itemsSummary[item.name] += item.quantity;
        } else {
          itemsSummary[item.name] = item.quantity;
        }
      });
    });

    // Prepare data for PDF
    let yOffset = 10;
    doc.text("Order Placed Food Items Summary", 10, yOffset);
    yOffset += 10;
    doc.text("------------------------------", 10, yOffset);
    yOffset += 10;

    for (const itemName in itemsSummary) {
      if (itemsSummary.hasOwnProperty(itemName)) {
        doc.text(`${itemName}: ${itemsSummary[itemName]}`, 10, yOffset);
        yOffset += 7;
      }
    }

    // Save the PDF
    doc.save('order_placed_food_items_summary.pdf');
  };

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

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users ({filteredAndSortedData.users.length})</TabsTrigger>
          <TabsTrigger value="orders">Orders ({filteredAndSortedData.orders.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({filteredAndSortedData.activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && filteredAndSortedData.users.length === 0 ? (
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => confirmDelete('user', user.id)}
                          disabled={user.role === "admin"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Placed Orders */}
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Order Placed</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportOrderPlacedFoodItems}
                    disabled={filteredAndSortedData.orders.filter(order => order.status === 'order_placed' || order.trackingStatus === 'order_placed').length === 0 || loading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading && filteredAndSortedData.orders.length === 0 ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredAndSortedData.orders.filter(order => order.status === 'order_placed' || order.trackingStatus === 'order_placed').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No order placed orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
                      {filteredAndSortedData.orders
                        .filter(order => order.status === 'order_placed' || order.trackingStatus === 'order_placed')
                        .map((order) => (
                          <Card key={order.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">Order #{typeof order.id === 'string' ? order.id.slice(-8) : order.id}</p>
                                <p className="text-sm text-gray-500">
                                  {order.userDetails?.name || "Unknown User"}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge>{order.trackingStatus || order.status || "Unknown"}</Badge>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => confirmDelete('order', order.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              <p>Items: {order.items?.length || 0}</p>
                              <p>Created: {formatDate(order.createdAt)}</p>
                            </div>
                            {/* Display Order Items */}
                            {order.items && order.items.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="font-medium mb-2">Items:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {order.items.map(item => (
                                    <li key={item.id} className="text-sm text-gray-700">
                                      {item.name} (x{item.quantity})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Delivered Orders */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Delivered</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading && filteredAndSortedData.orders.length === 0 ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredAndSortedData.orders.filter(order => order.status === 'delivered' || order.trackingStatus === 'delivered').length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No delivered orders found</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
                      {filteredAndSortedData.orders
                        .filter(order => order.status === 'delivered' || order.trackingStatus === 'delivered')
                        .map((order) => (
                          <Card key={order.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-medium">Order #{typeof order.id === 'string' ? order.id.slice(-8) : order.id}</p>
                                <p className="text-sm text-gray-500">
                                  {order.userDetails?.name || "Unknown User"}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge>{order.trackingStatus || order.status || "Unknown"}</Badge>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => confirmDelete('order', order.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              <p>Items: {order.items?.length || 0}</p>
                              <p>Created: {formatDate(order.createdAt)}</p>
                            </div>
                            {/* Display Order Items */}
                            {order.items && order.items.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="font-medium mb-2">Items:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {order.items.map(item => (
                                    <li key={item.id} className="text-sm text-gray-700">
                                      {item.name} (x{item.quantity})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-gray-500">
                            {formatDate(activity.timestamp)}
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => confirmDelete('activity', activity.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin; 