import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera, CheckCircle2, Upload } from "lucide-react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface FileDeliveryScannerProps {
  onScanSuccess?: (userId: string) => Promise<void>;
}

const FileDeliveryScanner: React.FC<FileDeliveryScannerProps> = ({ onScanSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const { useToken } = useSubscription();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setProcessing(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const qrData = JSON.parse(text);
          
          if (qrData.type !== "campus-bite-order") {
            throw new Error("Invalid QR code file");
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
            "trackingStatus": "delivered"
          });

          setOrderId(qrData.orderId);

          // Call onScanSuccess if provided
          if (onScanSuccess) {
            await onScanSuccess(orderData.userId);
          }

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
          setProcessing(false);
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read the QR code file",
          variant: "destructive",
        });
        setProcessing(false);
      };

      reader.readAsText(file);
    } catch (error: any) {
      console.error("Error reading file:", error);
      toast({
        title: "Error",
        description: "Failed to read the file",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Delivery Scanner</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="w-full aspect-square max-w-sm bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <label 
            htmlFor="qr-file" 
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <span className="text-gray-600">Click to upload QR code file</span>
            <input
              id="qr-file"
              type="file"
              accept=".txt,.json"
              className="hidden"
              onChange={handleFileUpload}
              disabled={processing}
            />
          </label>
        </div>

        {processing && (
          <div className="text-center text-gray-600">
            <Camera className="h-8 w-8 mx-auto animate-pulse mb-2" />
            <p>Processing delivery...</p>
          </div>
        )}

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
              Process Next Order
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileDeliveryScanner; 