import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const { currentUser } = useAuth();

  // Load cart from localStorage when user is authenticated
  useEffect(() => {
    if (currentUser) {
      const userCartKey = `campusBiteCart_${currentUser.uid}`;
      const savedCart = localStorage.getItem(userCartKey);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error("Failed to parse saved cart:", error);
          localStorage.removeItem(userCartKey);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [currentUser]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      const userCartKey = `campusBiteCart_${currentUser.uid}`;
      try {
        localStorage.setItem(userCartKey, JSON.stringify(cart));
      } catch (error) {
        console.error("Failed to save cart:", error);
      }
    }
  }, [cart, currentUser]);

  const addToCart = (item: MenuItem) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        
        toast({
          title: "Item added",
          description: `${item.name} quantity increased to ${updatedCart[existingItemIndex].quantity}`,
        });
        
        return updatedCart;
      } else {
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
    if (currentUser) {
      const userCartKey = `campusBiteCart_${currentUser.uid}`;
      localStorage.removeItem(userCartKey);
    }
    setCart([]);
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
