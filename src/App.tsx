import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

// Import pages
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Cart from "@/pages/Cart";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Orders from "@/pages/Orders";
import Subscription from "@/pages/Subscription";
import Admin from "@/pages/Admin";
import Delivery from "@/pages/Delivery";
import DeliveryScanner from "@/pages/DeliveryScanner";
import CompletedDeliveries from "@/pages/CompletedDeliveries";
import PendingOrders from "@/pages/PendingOrders";
import TokensPage from "@/pages/TokensPage";
import NotFound from "@/pages/NotFound";

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

// Delivery Route component
const DeliveryRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isDeliveryPartner } = useAuth();
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  if (!isDeliveryPartner) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

// Layout component
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <SubscriptionProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/subscription" element={<Subscription />} />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="/tokens" element={
                <ProtectedRoute>
                  <TokensPage />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } />

              <Route path="/delivery" element={
                <DeliveryRoute>
                  <Delivery />
                </DeliveryRoute>
              } />
              <Route path="/delivery/scanner" element={
                <DeliveryRoute>
                  <DeliveryScanner />
                </DeliveryRoute>
              } />
              <Route path="/delivery/completed" element={
                <DeliveryRoute>
                  <CompletedDeliveries />
                </DeliveryRoute>
              } />
              <Route path="/pending-orders" element={
                <DeliveryRoute>
                  <PendingOrders />
                </DeliveryRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <Toaster />
        </SubscriptionProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
