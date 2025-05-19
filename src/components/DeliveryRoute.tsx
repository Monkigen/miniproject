import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const DeliveryRoute = () => {
  const { currentUser, isDeliveryPartner } = useAuth();

  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  if (!isDeliveryPartner) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}; 