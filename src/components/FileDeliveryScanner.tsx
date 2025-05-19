import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { QrCode, CheckCircle2, AlertCircle, Camera, Upload } from "lucide-react";
import jsQR from "jsqr";

interface FileDeliveryScannerProps {
  onScanSuccess?: (userId: string) => Promise<void>;
  onOrderCompleted?: () => Promise<void>;
}

const FileDeliveryScanner: React.FC<FileDeliveryScannerProps> = ({ onScanSuccess, onOrderCompleted }) => {
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { toast } = useToast();
  const { useToken } = useSubscription();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PNG or JPG image file.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(true);
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const img = new Image();
          img.src = e.target?.result as string;
          
          img.onload = async () => {
            try {
              // Create canvas to process image
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              
              // Set canvas size to match image
              canvas.width = img.width;
              canvas.height = img.height;
              
              if (!context) {
                throw new Error("Failed to create canvas context");
              }
              
              // Draw image on canvas
              context.drawImage(img, 0, 0, img.width, img.height);
              
              // Get image data
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              
              // Try different scales for better QR code detection
              const scales = [1, 1.5, 2];
              let code = null;
              
              for (const scale of scales) {
                // Create a scaled canvas
                const scaledCanvas = document.createElement('canvas');
                const scaledContext = scaledCanvas.getContext('2d');
                
                if (!scaledContext) continue;
                
                // Set scaled dimensions
                scaledCanvas.width = canvas.width * scale;
                scaledCanvas.height = canvas.height * scale;
                
                // Draw scaled image
                scaledContext.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
                
                // Get scaled image data
                const scaledImageData = scaledContext.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
                
                // Try to detect QR code
                code = jsQR(scaledImageData.data, scaledImageData.width, scaledImageData.height, {
                  inversionAttempts: "dontInvert",
                });
                
                if (code) break;
              }
              
              if (!code) {
                // If QR code not found, try with image enhancement
                context.filter = 'contrast(1.2) brightness(1.1)';
                context.drawImage(img, 0, 0, img.width, img.height);
                const enhancedImageData = context.getImageData(0, 0, canvas.width, canvas.height);
                code = jsQR(enhancedImageData.data, enhancedImageData.width, enhancedImageData.height, {
                  inversionAttempts: "dontInvert",
                });
              }
              
              if (!code) {
                toast({
                  title: "QR Code Not Found",
                  description: "Please make sure the QR code is clear, well-lit, and not blurry in the image.",
                  variant: "destructive",
                });
                setProcessing(false);
                return;
              }

              // Parse QR code data
              let qrData;
              try {
                qrData = JSON.parse(code.data);
              } catch (error) {
                toast({
                  title: "Invalid QR Code",
                  description: "The QR code format is not valid. Please make sure you're scanning the correct QR code.",
                  variant: "destructive",
                });
                setProcessing(false);
                return;
              }
              
              if (qrData.type !== "campus-bite-order") {
                toast({
                  title: "Invalid QR Code",
                  description: "This QR code is not from Campus Kitchen. Please scan the correct QR code.",
                  variant: "destructive",
                });
                setProcessing(false);
                return;
              }

              const orderRef = doc(db, "orders", qrData.orderId);
              const orderDoc = await getDoc(orderRef);
              
              if (!orderDoc.exists()) {
                toast({
                  title: "Order Not Found",
                  description: "The order associated with this QR code could not be found.",
                  variant: "destructive",
                });
                setProcessing(false);
                return;
              }

              const orderData = orderDoc.data();
              
              if (orderData.deliveryDetails.status === "delivered") {
                toast({
                  title: "Order Already Delivered",
                  description: "This order has already been marked as delivered.",
                  variant: "destructive",
                });
                setProcessing(false);
                return;
              }

              // Get user document to check and deduct tokens
              const userRef = doc(db, "users", orderData.userId);
              const userDoc = await getDoc(userRef);
              
              if (!userDoc.exists()) {
                toast({
                  title: "User Not Found",
                  description: "The user associated with this order could not be found.",
                  variant: "destructive",
                });
                setProcessing(false);
                return;
              }

              const userData = userDoc.data();
              
              // Calculate total quantity of items in the order
              const totalQuantity = orderData.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
              
              // Check if user has enough tokens
              if (!userData.tokens || userData.tokens < totalQuantity) {
                toast({
                  title: "Insufficient Tokens",
                  description: `User has insufficient tokens. Required: ${totalQuantity}, Available: ${userData.tokens}`,
                  variant: "destructive",
                });
                setProcessing(false);
                return;
              }

              // Deduct tokens based on order quantity
              await updateDoc(userRef, {
                tokens: userData.tokens - totalQuantity
              });

              // Update order status
              await updateDoc(orderRef, {
                "deliveryDetails.status": "delivered",
                "deliveryDetails.deliveredAt": new Date().toISOString(),
                "trackingStatus": "delivered",
                "tokenDeducted": true,
                "tokensDeducted": totalQuantity
              });

              setOrderId(qrData.orderId);

              // Call onScanSuccess if provided
              if (onScanSuccess) {
                await onScanSuccess(orderData.userId);
              }

              // Call onOrderCompleted to refresh the completed orders list
              if (onOrderCompleted) {
                await onOrderCompleted();
              }

              toast({
                title: "Success",
                description: `Order processed and ${totalQuantity} token${totalQuantity > 1 ? 's' : ''} deducted successfully`,
              });
            } catch (error: any) {
              console.error("Error processing QR code:", error);
              toast({
                title: "Error",
                description: error.message || "Failed to process QR code",
                variant: "destructive",
              });
            } finally {
              setProcessing(false);
            }
          };

          img.onerror = () => {
            toast({
              title: "Error",
              description: "Failed to load the image. Please try again.",
              variant: "destructive",
            });
            setProcessing(false);
          };
        } catch (error: any) {
          console.error("Error reading file:", error);
          toast({
            title: "Error",
            description: "Failed to read the file. Please try again.",
            variant: "destructive",
          });
          setProcessing(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error reading file:", error);
      toast({
        title: "Error",
        description: "Failed to read the file. Please try again.",
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
            <span className="text-gray-600">Click to upload QR code image (PNG/JPG)</span>
            <input
              id="qr-file"
              type="file"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileUpload}
              disabled={processing}
            />
          </label>
        </div>

        {processing && (
          <div className="text-center text-gray-600">
            <Camera className="h-8 w-8 mx-auto animate-pulse mb-2" />
            <p>Processing QR code...</p>
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

        <div className="w-full space-y-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>Upload a PNG or JPG image of the customer's QR code</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileDeliveryScanner; 