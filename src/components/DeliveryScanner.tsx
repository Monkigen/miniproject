import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { QrCode, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

const DeliveryScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const { useToken } = useSubscription();

  useEffect(() => {
    // Initialize QR code scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false // verbose mode
    );

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear();
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    try {
      setScanning(true);
      const qrData = JSON.parse(decodedText);
      
      if (qrData.type !== "campus-bite-order") {
        throw new Error("Invalid QR code");
      }

      const orderRef = doc(db, "orders", qrData.orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error("Order not found");
      }

      const orderData = orderDoc.data();
      
      if (orderData.deliveryDetails.status === "delivered") {
        throw new Error("Order already delivered");
      }

      // Update order status
      await updateDoc(orderRef, {
        "deliveryDetails.status": "delivered",
        "deliveryDetails.deliveredAt": new Date().toISOString(),
        "deliveryDetails.deliveryPerson": "Delivery Person ID", // Replace with actual delivery person ID
        "trackingStatus": "delivered"
      });

      setOrderId(qrData.orderId);

      // Deduct token after successful delivery
      if (orderData.usingTokens && !orderData.tokenDeducted) {
        const tokenUsed = await useToken();
        if (tokenUsed) {
          await updateDoc(orderRef, {
            tokenDeducted: true
          });
        }
      }

      toast({
        title: "Delivery Confirmed",
        description: "Order has been marked as delivered and token has been deducted.",
      });
    } catch (error: any) {
      console.error("Error processing delivery:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process delivery",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const onScanError = (error: any) => {
    console.warn(`QR Code scan error: ${error}`);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Delivery Scanner</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div id="qr-reader" className="w-full aspect-square max-w-sm bg-gray-100 rounded-lg overflow-hidden">
          {scanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <Camera className="h-12 w-12 mx-auto animate-pulse" />
                <p className="mt-2">Scanning...</p>
              </div>
            </div>
          )}
        </div>

        {orderId && (
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Order #{orderId} processed successfully</span>
            </div>
            <Button 
              className="w-full mt-4"
              onClick={() => setOrderId(null)}
            >
              Scan Next Order
            </Button>
          </div>
        )}

        <div className="w-full space-y-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>Scan the customer's QR code to confirm delivery</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliveryScanner; 