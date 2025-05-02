import React from "react";
import { useCart, CartItem as CartItemType } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
        <img
          src={item.image}
          alt={item.name}
        className="w-20 h-20 object-cover rounded-md"
        />
      <div className="flex-grow">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-600">{item.description}</p>
      </div>
      <div className="flex items-center gap-2">
            <Button
          variant="outline"
              size="icon"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
          <Minus className="h-4 w-4" />
            </Button>
        <span className="w-8 text-center">{item.quantity}</span>
            <Button
          variant="outline"
              size="icon"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
          <Plus className="h-4 w-4" />
            </Button>
          <Button
            variant="ghost"
            size="icon"
          onClick={() => removeFromCart(item.id)}
          >
          <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
      </div>
    </div>
  );
};

export default CartItem;
