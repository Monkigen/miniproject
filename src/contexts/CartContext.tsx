import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price?: number;
  image: string;
  category: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextProps {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("campusBiteCart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse saved cart:", error);
        // If there's an error parsing the cart, clear it
        localStorage.removeItem("campusBiteCart");
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
    localStorage.setItem("campusBiteCart", JSON.stringify(cart));
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);

      if (existingItemIndex >= 0) {
        // Item exists, increment quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        
        toast({
          title: "Item added",
          description: `${item.name} quantity increased to ${updatedCart[existingItemIndex].quantity}`,
        });
        
        return updatedCart;
      } else {
        // Item doesn't exist, add it with quantity 1
        const newCart = [...prevCart, { ...item, quantity: 1 }];
        
        toast({
          title: "Item added",
          description: `${item.name} added to your cart`,
        });
        
        return newCart;
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const removedItem = prevCart.find(item => item.id === itemId);
      if (removedItem) {
        toast({
          title: "Item removed",
          description: `${removedItem.name} removed from your cart`,
        });
      }
      return prevCart.filter((item) => item.id !== itemId);
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, quantity };
          toast({
            title: "Quantity updated",
            description: `${item.name} quantity set to ${quantity}`,
          });
          return updatedItem;
        }
        return item;
      });
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("campusBiteCart");
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
