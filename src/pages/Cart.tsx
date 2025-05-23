import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CartItem from "@/components/CartItem";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { ShoppingCart, ArrowLeft, AlertCircle, Coins } from "lucide-react";
import { createOrder } from "@/lib/firebase";
import { useToast } from "@/components/ui/use-toast";
import OrderQRCode from "@/components/OrderQRCode";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const Cart = () => {
  const { cart, clearCart, totalItems } = useCart();
  const { currentUser } = useAuth();
  const { tokens, canPlaceOrder } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load saved delivery details from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('deliveryPhone');
    const savedLocation = localStorage.getItem('deliveryLocation');
    if (savedPhone) setPhone(savedPhone);
    if (savedLocation) setLocation(savedLocation);
  }, []);

  // Save delivery details to localStorage when they change
  useEffect(() => {
    if (phone) localStorage.setItem('deliveryPhone', phone);
    if (location) localStorage.setItem('deliveryLocation', location);
  }, [phone, location]);

  const handleCheckout = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to place an order.",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items before checking out.",
        variant: "destructive",
      });
      return;
    }

    if (!phone || !location) {
      toast({
        title: "Missing Information",
        description: "Please provide phone number and college location.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      
      // Generate a unique order ID with timestamp for better uniqueness
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 10);
      const orderId = `order-${timestamp}-${randomStr}`;
      
      // Calculate total
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Create order object with tracking status
      const orderData = {
        id: orderId,
        userId: currentUser.uid,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: total,
        status: "pending",
        trackingStatus: "order_placed",
        createdAt: new Date(),
        usingTokens: true,
        tokenDeducted: false,
        deliveryDetails: {
          status: "pending",
          scannedAt: null,
          deliveredAt: null,
          deliveryPerson: null,
          estimatedTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
          location: location,
          phone: phone
        },
        totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
        lastUpdated: new Date().toISOString(),
        userDetails: {
          name: currentUser.displayName || "Customer",
          email: currentUser.email || "",
          phone: phone
        }
      };
      
      // Save order to Firebase with error handling
      try {
        await setDoc(doc(db, "orders", orderId), orderData);
        
        // Verify the order was saved
        const orderRef = doc(db, "orders", orderId);
        const orderDoc = await getDoc(orderRef);
      
        if (!orderDoc.exists()) {
          throw new Error("Failed to verify order creation");
      }
      
      toast({
        title: "Order placed successfully!",
          description: `Your order #${orderId} has been placed. Show the QR code to the delivery person.`,
      });
      
        setCompletedOrder(orderData);
      clearCart();
      } catch (error: any) {
        console.error("Error saving order:", error);
        throw new Error("Failed to save order to database");
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast({
        title: "Failed to place order",
        description: error.message || "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Order Placed Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {completedOrder && completedOrder.id && (
              <OrderQRCode 
                order={completedOrder}
                onClose={() => navigate('/orders')}
              />
            )}
            <p className="text-center text-gray-600">
              Show this QR code to the delivery person when they arrive
            </p>
            <div className="w-full space-y-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Order Placed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span>Waiting for Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <span>Delivered</span>
          </div>
        </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/orders">View Order Details</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-4 sm:mb-6 md:mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/menu">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Your Cart</h1>
      </div>

      {cart.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">Add some delicious meals to your cart</p>
            <Button asChild>
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Cart Items</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-gray-600">Total Items</span>
                  <span className="text-sm sm:text-base font-semibold">{totalItems}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                    <Coins className="h-4 w-4" />
                    <span>Available Tokens: {tokens}</span>
                  </div>
                  {tokens <= 0 && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <span>No tokens available</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Delivery Details</h3>
                    {!isEditing && (phone || location) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-xs"
                      >
                        Change
                      </Button>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span>Phone Number:</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 p-1 border rounded-md text-xs"
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span>College Location:</span>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="flex-1 p-1 border rounded-md text-xs"
                          placeholder="Enter college location"
                          required
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        className="w-full mt-2"
                      >
                        Save Details
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {phone && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Phone:</span>
                          <span>{phone}</span>
                        </div>
                      )}
                      {location && (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <span className="font-medium">Location:</span>
                          <span>{location}</span>
                        </div>
                      )}
                      {!phone && !location && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                          className="w-full"
                        >
                          Add Delivery Details
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="px-4 sm:px-6">
                <Button
                  className="w-full text-sm sm:text-base" 
                  onClick={handleCheckout}
                  disabled={!canPlaceOrder || processing || !phone || !location}
                >
                  {processing ? "Processing..." : "Place Order"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
