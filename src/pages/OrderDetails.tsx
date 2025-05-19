import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, Package, CheckCircle2 } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered";
  orderTime: string;
  deliveryLocation: string;
}

const mockOrder: Order = {
  id: "ORD-001",
  items: [
    {
      id: "1",
      name: "Breakfast Special",
      description: "Idli, Dosa, Vada, and Sambar",
      price: 0,
      quantity: 1
    }
  ],
  total: 0,
  status: "delivered",
  orderTime: "10:30 AM",
  deliveryLocation: "Building A, Room 101"
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Order Details</CardTitle>
              <Button variant="outline" onClick={() => navigate("/orders")}>
                Back to Orders
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Order {orderId}</h2>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-5 w-5" />
                <span>Ordered at {mockOrder.orderTime}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5" />
                <span>{mockOrder.deliveryLocation}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {mockOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">${mockOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetails; 