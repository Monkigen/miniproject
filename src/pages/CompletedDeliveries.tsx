import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, MapPin, User } from "lucide-react";

interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  location: string;
  time: string;
  status: "completed" | "in-progress";
}

const mockDeliveries: Delivery[] = [
  {
    id: "1",
    orderId: "ORD-001",
    customerName: "John Doe",
    location: "Building A, Room 101",
    time: "10:30 AM",
    status: "completed"
  },
  {
    id: "2",
    orderId: "ORD-002",
    customerName: "Jane Smith",
    location: "Library, 2nd Floor",
    time: "11:45 AM",
    status: "completed"
  },
  {
    id: "3",
    orderId: "ORD-003",
    customerName: "Mike Johnson",
    location: "Student Center",
    time: "12:15 PM",
    status: "completed"
  },
  {
    id: "4",
    orderId: "ORD-004",
    customerName: "Sarah Wilson",
    location: "Dorm B, Room 205",
    time: "1:00 PM",
    status: "completed"
  }
];

const CompletedDeliveries = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Completed Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDeliveries.map((delivery) => (
                <Card key={delivery.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Order {delivery.orderId}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{delivery.customerName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{delivery.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{delivery.time}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompletedDeliveries; 