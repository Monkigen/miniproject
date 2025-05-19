import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface DeliveryDetails {
  status: string;
  estimatedTime?: string;
  deliveredAt?: string;
  deliveryPerson?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: string;
  trackingStatus: string;
  createdAt: any;
  deliveryDetails?: DeliveryDetails;
  userDetails?: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface QRCodeData {
  type: string;
  orderId: string;
  timestamp: number;
  orderDetails: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    status: string;
    trackingStatus: string;
    createdAt: string;
  };
  userDetails: {
    name: string;
    email: string;
    phone?: string;
  };
  verificationCode: string;
}

interface OrderQRCodeProps {
  order: Order;
  onClose: () => void;
}

const OrderQRCode: React.FC<OrderQRCodeProps> = ({ order, onClose }) => {
  const formatDate = (date: any): string => {
    if (!date) return new Date().toISOString();
    
    if (date.seconds) {
      return new Date(date.seconds * 1000).toISOString();
    }
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    if (typeof date === 'string') {
      return new Date(date).toISOString();
    }
    
    return new Date().toISOString();
  };

  const generateQRCodeData = (order: Order): string => {
    try {
      const qrData: QRCodeData = {
        type: "campus-bite-order",
        orderId: order.id,
        timestamp: Date.now(),
        orderDetails: {
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: order.total || 0,
          status: order.status || "pending",
          trackingStatus: order.trackingStatus || "order_placed",
          createdAt: formatDate(order.createdAt)
        },
        userDetails: {
          name: order.userDetails?.name || "N/A",
          email: order.userDetails?.email || "N/A",
          phone: order.userDetails?.phone
        },
        verificationCode: order.id.slice(-6).toUpperCase()
      };
      return JSON.stringify(qrData);
    } catch (error) {
      console.error("Error generating QR code data:", error);
      return JSON.stringify({
        type: "campus-bite-order",
        orderId: order.id,
        error: "Failed to generate QR code data"
      });
    }
  };

  if (!order || !order.id) {
    return null;
  }

  const total = order.total || 0;
  const items = order.items || [];
  const userDetails = order.userDetails || { name: "N/A", email: "N/A" };
  const deliveryDetails: DeliveryDetails = order.deliveryDetails || { status: "pending" };
  
  // Calculate total quantity of all items
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Order QR Code</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
      </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
          <QRCodeSVG 
                value={generateQRCodeData(order)}
                size={250}
            level="H"
            includeMargin
                bgColor="#ffffff"
                fgColor="#000000"
          />
        </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">Verification Code: {order.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-gray-500">
                Scan this QR code to confirm delivery and update order status
              </p>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Order Details</h3>
            <div className="text-sm space-y-1">
              <p>Order ID: {order.id}</p>
              <p>Status: {order.trackingStatus || "Pending"}</p>
              <p>Total Items: {totalQuantity}</p>
              <p>Customer: {userDetails.name}</p>
              <p>Email: {userDetails.email}</p>
              {userDetails.phone && <p>Phone: {userDetails.phone}</p>}
              {deliveryDetails.estimatedTime && (
                <p>Estimated Delivery: {new Date(deliveryDetails.estimatedTime).toLocaleTimeString()}</p>
              )}
              {deliveryDetails.deliveryPerson && (
                <p>Delivery Person: {deliveryDetails.deliveryPerson}</p>
              )}
            </div>
          </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default OrderQRCode;
