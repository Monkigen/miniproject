import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Index from "@/pages/Index";
import Menu from "@/pages/Menu";
import Cart from "@/pages/Cart";
import Orders from "@/pages/Orders";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import SubscriptionPlans from "@/pages/Subscription";
import TokensPage from "@/pages/TokensPage";
import Scanner from "@/pages/Scanner";
import Admin from "@/pages/Admin";
import Delivery from "@/pages/Delivery";
import Home from "@/pages/Home";

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  return <>{children}</>;
};

// Admin Route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isAdmin } = useAuth();
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const { currentUser, isAdmin } = useAuth();

  // Redirect admin users to admin page if they're on the home page
  if (currentUser && isAdmin && window.location.pathname === "/") {
    return <Navigate to="/admin" />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route path="/subscription" element={<SubscriptionPlans />} />
      <Route path="/tokens" element={<TokensPage />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/delivery" element={<Delivery />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
  <QueryClientProvider client={queryClient}>
        <ThemeProvider>
    <AuthProvider>
      <CartProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                      <AppRoutes />
                </main>
              </div>
          </TooltipProvider>
        </SubscriptionProvider>
      </CartProvider>
    </AuthProvider>
        </ThemeProvider>
  </QueryClientProvider>
    </Router>
);
};

export default App;
