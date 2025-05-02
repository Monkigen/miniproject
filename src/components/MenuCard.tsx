import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealPlan } from "@/pages/Menu";
import { useCart } from "@/contexts/CartContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar, Lock, AlertCircle, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MenuCardProps {
  plan: MealPlan;
}

const MenuCard: React.FC<MenuCardProps> = ({ plan }) => {
  const { addToCart } = useCart();
  const { canPlaceOrder, tokens, subscription } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!subscription) {
        toast({
        title: "Subscription Required",
        description: "Please subscribe to a meal plan to unlock all features.",
          variant: "destructive",
        });
      navigate("/subscription");
        return;
      }
      
    if (!subscription.active) {
        toast({
        title: "Subscription Expired",
        description: "Your subscription has expired. Please renew to continue ordering meals.",
          variant: "destructive",
        });
      navigate("/subscription");
        return;
      }

    if (tokens <= 0) {
      toast({
        title: "No Tokens Available",
        description: "You have no tokens left. Please check your subscription status.",
        variant: "destructive",
      });
      navigate("/tokens");
      return;
    }
    
    try {
    addToCart({
      id: plan.id,
      name: plan.title,
      description: plan.description,
        image: plan.images[0].url,
      category: plan.type,
        price: 0
    });
    
    toast({
      title: "Added to cart",
        description: `${plan.title} has been added to your cart.`,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
    });
    }
  };

  const isLocked = plan.isLocked && !subscription;
  const buttonText = !subscription ? "Subscribe to Unlock" :
                    !subscription.active ? "Renew Subscription" :
                    tokens <= 0 ? "No Tokens Available" :
                    "Add to Cart";

  return (
    <Card className={`overflow-hidden ${isLocked ? 'opacity-75' : ''}`}>
      <CardHeader className="p-0">
        <div className="relative h-48">
          <img
            src={plan.images[0].url}
            alt={plan.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <CardTitle className="text-white text-2xl">{plan.title}</CardTitle>
              </div>
          {isLocked && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm flex items-center gap-1">
              <Lock size={14} />
              <span>Subscribe to Unlock</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-gray-600 mb-4">{plan.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Available Monday to Saturday</span>
        </div>
        
          {subscription && tokens > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">{tokens} tokens available</span>
          </div>
        )}
        </div>

        <Button 
          onClick={handleAddToCart}
          className="w-full"
          disabled={isLocked || !canPlaceOrder}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
