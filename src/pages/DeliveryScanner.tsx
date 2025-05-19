import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { QrCode, Package, CheckCircle2, AlertCircle } from "lucide-react";

const DeliveryScanner = () => {
  const [orderId, setOrderId] = useState("");
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const handleScan = () => {
    if (!orderId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an order ID",
        variant: "destructive",
      });
      return;
    }

    setScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setScanning(false);
      toast({
        title: "Success",
        description: "Order scanned successfully",
      });
      setOrderId("");
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Delivery Scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <QrCode className="h-8 w-8 text-campus-green" />
              <div>
                <h2 className="text-xl font-semibold">Scan Order QR Code</h2>
                <p className="text-gray-600">Scan the QR code to verify and complete delivery</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Enter Order ID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleScan}
                  disabled={scanning}
                  className="bg-campus-green hover:bg-campus-green/90"
                >
                  {scanning ? "Scanning..." : "Scan"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-500" />
                      <span>Pending Deliveries: 5</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>Completed Today: 12</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Delivery Guidelines</h3>
                  <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                    <li>Always verify the order ID before delivery</li>
                    <li>Ensure the customer receives the correct order</li>
                    <li>Get confirmation from the customer</li>
                    <li>Mark the delivery as complete in the system</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryScanner; 