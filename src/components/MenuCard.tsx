import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealPlan } from "@/pages/Menu";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export interface MenuCardProps {
  item: MealPlan;
  onAddToCart?: (item: MealPlan) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleAddToCart = () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      addToCart({
        id: item.id,
        name: item.title,
        description: item.description,
        image: item.images[0].url,
        category: item.type,
        price: 0
      });

      toast({
        title: "Added to cart",
        description: `${item.title} has been added to your cart.`,
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

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        <img
          src={item.images[0].url}
          alt={item.title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-base sm:text-lg">{item.title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
        <Button 
          className="w-full text-sm sm:text-base"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
};

export default MenuCard;
