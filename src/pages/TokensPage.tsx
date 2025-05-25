import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import OrderQRCode from "@/components/OrderQRCode";
import { Coins, AlertCircle, CalendarDays, RefreshCw, History, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const TokensPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { subscription, tokens, loading, refreshSubscription } = useSubscription();
  const [showQRExample, setShowQRExample] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/auth", { state: { redirect: "/tokens" } });
    }
  }, [currentUser, navigate]);

  // Memoize the token display data
  const tokenDisplayData = useMemo(() => ({
    availableTokens: tokens,
    usedTokens: 0
  }), [tokens]);

  // Memoize the subscription details
  const subscriptionDetails = useMemo(() => {
    if (!subscription) return null;
    return {
      plan: subscription.plan,
      active: subscription.active,
      startDate: new Date(subscription.startDate).toLocaleDateString(),
      endDate: new Date(subscription.endDate).toLocaleDateString()
    };
  }, [subscription]);

  // Memoize the handleExtendTokens function
  const handleExtendTokens = useCallback(async () => {
    if (!subscription || !currentUser) return;
    
    setIsExtending(true);
    try {
      const currentEndDate = new Date(subscription.endDate);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + 2);

      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        "subscription.endDate": newEndDate.toISOString(),
        "subscription.active": true,
        "subscription.hasExtended": true
      });
      
      await refreshSubscription();
      toast.success("Token expiration date extended successfully!");
    } catch (error) {
      console.error("Error extending token expiration:", error);
      toast.error("Failed to extend token expiration date. Please try again.");
    } finally {
      setIsExtending(false);
    }
  }, [subscription, currentUser, refreshSubscription]);

  // Memoize the QR code example data
  const qrExampleData = useMemo(() => ({
    id: "example-order-123",
    userId: currentUser?.uid || "",
    items: [
      { id: "1", name: "Sample Meal", price: 0, quantity: 1 }
    ],
    total: 0,
    status: "pending",
    trackingStatus: "order_placed",
    createdAt: new Date(),
    userDetails: {
      name: currentUser?.displayName || "Sample User",
      email: currentUser?.email || "sample@example.com"
    }
  }), [currentUser]);

  if (!currentUser) {
    return null; // Return null while redirecting
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto p-8">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw size={48} className="animate-spin text-campus-green mb-4" />
            <p>Loading your subscription details...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Tokens & Subscription</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Token Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2" /> Your Tokens
            </CardTitle>
            <CardDescription>Use tokens to order meals before 8:10 AM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-xl mb-2">Subscribed Tokens</div>
                {/* Show Used Tokens and Remaining Balance if subscription is active */}
                {subscription?.active && subscription.tokens !== undefined && ( // Check if subscription is active and initial tokens are available
                  <div className="text-sm text-gray-600 space-y-2 mt-4">
                    <div className="flex justify-between items-center">
                      <span>Initial Tokens:</span>
                      <span className="font-medium">{subscription.tokens}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Used Tokens:</span>
                      <span className="font-medium">{(subscription.tokens || 0) - (tokens || 0)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center font-medium">
                      <span>Remaining Balance:</span>
                      <span className="text-campus-green">{tokens}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {tokens <= 0 && (
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 flex items-start gap-2 mt-2">
                <AlertCircle size={18} className="text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium">You have no tokens available</p>
                  <p className="text-sm mt-1">
                    Subscribe to a meal plan to receive tokens for ordering meals.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full">
              {tokens > 0 && (
                <Button 
                  className="w-full mb-3 bg-campus-green hover:bg-campus-green/90"
                  onClick={() => setShowQRExample(true)}
                >
                  View QR Code Demo
                </Button>
              )}
              <Link to="/subscription" className="w-full">
                <Button variant="outline" className="w-full">
                  Get More Tokens
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2" /> Subscription Details
            </CardTitle>
            <CardDescription>
              {subscription?.active 
                ? `Your ${subscription?.plan} is currently active`
                : "You don't have an active subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Plan:</span>
                  <span>{subscription.plan}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {subscription.active ? "Active" : "Expired"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Start Date:</span>
                  <span>{new Date(subscription.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">End Date:</span>
                  <span>{new Date(subscription.endDate).toLocaleDateString()}</span>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-gray-500">
                    Remember to place your orders before 8:10 AM to use your tokens for the day's meals.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-gray-500 mb-6">You haven't subscribed to any meal plan yet.</p>
                <Link to="/subscription">
                  <Button className="bg-campus-green hover:bg-campus-green/90">
                    Browse Subscription Plans
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={refreshSubscription}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh Subscription Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Token Extension Section */}
      {subscription?.active && !subscription.hasExtended && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2" /> Extend Token Expiration
              </CardTitle>
              <CardDescription>
                Extend your token expiration date by up to two months (one-time only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium text-blue-900">Current Expiration Date</p>
                      <p className="text-blue-700 mt-1">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-blue-600 mt-2">
                        Extending your tokens will add 2 months to your current expiration date.
                        This extension can only be used once per subscription.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleExtendTokens}
                    disabled={isExtending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isExtending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Extending...
                      </>
                    ) : (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Extend Expiration Date
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Extension Status Section */}
      {subscription?.hasExtended && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="mr-2 text-green-600" /> Extension Status
              </CardTitle>
              <CardDescription>
                Your subscription has been extended
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 mt-1" />
                  <div>
                    <p className="font-medium text-green-900">Extension Applied</p>
                    <p className="text-green-700 mt-1">
                      Your subscription has been extended by 2 months.
                    </p>
                    <p className="text-sm text-green-600 mt-2">
                      New expiration date: {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Token History Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2" /> Token History
            </CardTitle>
            <CardDescription>Track your token usage and subscription history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Token History Items */}
              {subscription && (
                <>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <ArrowUpRight className="text-green-600 mr-3" />
                      <div>
                        <p className="font-medium">Subscription Started</p>
                        <p className="text-sm text-gray-600">{new Date(subscription.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-green-600 font-semibold">+{subscription.tokens} tokens</div>
                  </div>

                  {subscription.hasExtended && (
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium">Subscription Extended</p>
                          <p className="text-sm text-gray-600">
                            Extended by 2 months
                          </p>
                        </div>
                      </div>
                      <div className="text-blue-600 font-semibold">+2 months</div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Coins className="text-gray-600 mr-3" />
                      <div>
                        <p className="font-medium">Current Balance</p>
                        <p className="text-sm text-gray-600">As of {new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-gray-600 font-semibold">{tokens} tokens</div>
                  </div>

                  {subscription.endDate && (
                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center">
                        <CalendarDays className="text-yellow-600 mr-3" />
                        <div>
                          <p className="font-medium">Subscription Ends</p>
                          <p className="text-sm text-gray-600">{new Date(subscription.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-yellow-600 font-semibold">Plan: {subscription.plan}</div>
                    </div>
                  )}
                </>
              )}

              {!subscription && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No token history available</p>
                  <Link to="/subscription">
                    <Button className="bg-campus-green hover:bg-campus-green/90">
                      Start Your Subscription
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* QR Code Modal Example */}
      {showQRExample && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <OrderQRCode 
              order={qrExampleData}
              onClose={() => setShowQRExample(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(TokensPage);
