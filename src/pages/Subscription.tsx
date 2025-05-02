import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/components/ui/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SubscriptionPlans = () => {
  const { currentUser } = useAuth();
  const { tokens, subscription } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (plan: string, days: number, tokens: number, price: number) => {
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to subscribe to a meal plan",
        variant: "destructive",
      });
      navigate("/auth", { state: { redirect: "/subscription" } });
      return;
    }
    
    // In a real implementation, this would redirect to a payment gateway
    // For now, we'll simulate the subscription
    try {
      // Simulate payment gateway redirect
      const confirmed = window.confirm("You will be redirected to payment gateway. Continue?");
      if (!confirmed) return;
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // After successful payment, update user's subscription and tokens in Firebase
      const userRef = doc(db, "users", currentUser.uid);
      const subscriptionData = {
        plan,
        days,
        tokens,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
        active: true
      };
      
      await updateDoc(userRef, {
        subscription: subscriptionData,
        tokens: tokens // Add tokens to user's account
      });
      
      toast({
        title: "Subscription successful!",
        description: `You have successfully subscribed to the ${plan} plan and received ${tokens} tokens.`,
      });
      
      navigate("/tokens");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Subscription failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Define subscription plans
  const plans = [
    {
      id: "weekly",
      name: "Weekly Plan",
      description: "Perfect for trying out our meal service",
      price: 699,
      days: 7,
      tokens: 7,
      features: [
        "7 meal tokens",
        "Valid for 7 days",
        "Place orders before 8:10 AM",
        "Scan QR code for delivery",
      ]
    },
    {
      id: "biweekly",
      name: "Bi-Weekly Plan",
      description: "Our most popular subscription option",
      price: 1299,
      days: 15,
      tokens: 15,
      features: [
        "15 meal tokens",
        "Valid for 15 days",
        "Place orders before 8:10 AM",
        "Scan QR code for delivery",
        "Save 7% compared to weekly plan",
      ]
    },
    {
      id: "monthly",
      name: "Monthly Plan",
      description: "Best value for regular campus meals",
      price: 2499,
      days: 30,
      tokens: 30,
      features: [
        "30 meal tokens",
        "Valid for 30 days",
        "Place orders before 8:10 AM",
        "Scan QR code for delivery",
        "Save 12% compared to weekly plan",
      ]
    },
  ];

  // If user has tokens, show message instead of plans
  if (tokens > 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">You Already Have Tokens</h1>
          <p className="text-gray-600 mb-8">
            You currently have {tokens} tokens available. You can use these tokens to order meals.
            Once your tokens are depleted, you can return here to subscribe to a new plan.
          </p>
          <Link to="/tokens">
            <Button className="bg-campus-green hover:bg-campus-green/90">
              View My Tokens
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-4">Choose Your Meal Plan</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Select a subscription plan that fits your needs and enjoy delicious meals delivered right to your campus location
      </p>
      <div className="max-w-sm mx-auto mb-8">
        <div className="bg-campus-green/5 rounded-lg p-4 text-center">
          <p className="text-campus-green font-medium">💫 Most students choose our Bi-Weekly plan for the best value!</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300 border-2 hover:border-campus-green">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">{plan.name}</CardTitle>
              <CardDescription className="text-center">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-campus-green">₹{plan.price}</span>
                <span className="text-gray-500 ml-1">/ {plan.days} days</span>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={16} className="text-campus-green mr-2 mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSubscribe(plan.name, plan.days, plan.tokens, plan.price)}
                className="w-full bg-campus-green hover:bg-campus-green/90"
              >
                Subscribe Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 mb-2">
          All plans allow you to place orders before 8:10 AM and receive your meals on campus
        </p>
        {!currentUser && (
          <p className="text-sm">
            <Link to="/auth" className="text-campus-green hover:underline">
              Sign in or create an account
            </Link> to get started with your subscription.
          </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
