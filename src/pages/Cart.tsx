import React, { useState } from "react";
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
  const { cart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { tokens, canPlaceOrder } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

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
          estimatedTime: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        },
        totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
        lastUpdated: new Date().toISOString(),
        userDetails: {
          name: currentUser.displayName || "Customer",
          email: currentUser.email || "",
          phone: currentUser.phoneNumber || ""
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
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/menu">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Your Cart</h1>
      </div>

      {cart.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">Add some delicious meals to your cart</p>
            <Button asChild>
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-semibold">{cart.length}</span>
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Coins className="h-4 w-4" />
                  <span>Available Tokens: {tokens}</span>
                </div>
                {tokens <= 0 && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>No tokens available</span>
                </div>
                )}
            </CardContent>
            <CardFooter>
              <Button
                  className="w-full" 
                onClick={handleCheckout}
                  disabled={!canPlaceOrder || processing}
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
