
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle,
  PackageOpen,
  TruckIcon,
  CheckCircle
} from 'lucide-react';

interface OrderCancellationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  orderStatus: 'processing' | 'shipped' | 'delivered';
}

const OrderCancellation: React.FC<OrderCancellationProps> = ({ 
  open, 
  onOpenChange, 
  orderId,
  orderStatus
}) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const isCancellable = orderStatus === 'processing';
  const isReturnable = orderStatus === 'delivered';
  
  const handleSubmit = () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason",
        variant: "destructive",
      });
      return;
    }
    
    setProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setProcessing(false);
      onOpenChange(false);
      
      toast({
        title: isCancellable ? "Order Cancelled" : "Return Requested",
        description: isCancellable 
          ? `Order #${orderId} has been cancelled` 
          : `Return request for order #${orderId} has been submitted`,
      });
      
      setReason('');
      setDetails('');
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCancellable ? "Cancel Order" : "Request Return"}
          </DialogTitle>
          <DialogDescription>
            {isCancellable
              ? "You can cancel your order as it hasn't been shipped yet."
              : isReturnable
                ? "You can request a return within 30 days of delivery."
                : "This order is in transit and cannot be cancelled. You can refuse delivery or request a return once received."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm font-medium">Order Status:</div>
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              orderStatus === 'processing' 
                ? 'bg-amber-100 text-amber-800' 
                : orderStatus === 'shipped'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
            }`}>
              {orderStatus === 'processing' && (
                <PackageOpen className="w-3 h-3 mr-1" />
              )}
              {orderStatus === 'shipped' && (
                <TruckIcon className="w-3 h-3 mr-1" />
              )}
              {orderStatus === 'delivered' && (
                <CheckCircle className="w-3 h-3 mr-1" />
              )}
              {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
            </div>
          </div>
          
          {!isCancellable && !isReturnable ? (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4 flex">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                This order is in transit and cannot be cancelled online. 
                If you no longer want this order, you can refuse delivery when it arrives.
                Alternatively, you can request a return once the order is delivered.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium mb-1">
                  Reason for {isCancellable ? "cancellation" : "return"}
                </label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="changed_mind">Changed my mind</SelectItem>
                    <SelectItem value="wrong_item">Received wrong item</SelectItem>
                    <SelectItem value="defective">Item is defective/damaged</SelectItem>
                    <SelectItem value="not_as_described">Not as described</SelectItem>
                    <SelectItem value="found_better">Found better price elsewhere</SelectItem>
                    <SelectItem value="delayed_shipping">Shipping taking too long</SelectItem>
                    <SelectItem value="other">Other reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="details" className="block text-sm font-medium mb-1">
                  Additional details (optional)
                </label>
                <Textarea
                  id="details"
                  placeholder="Please provide any additional information..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                />
              </div>
              
              {isReturnable && (
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <h4 className="text-sm font-medium mb-2">Return Process:</h4>
                  <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                    <li>We'll review your return request</li>
                    <li>If approved, you'll receive a return shipping label via email</li>
                    <li>Package the item in its original packaging if possible</li>
                    <li>Attach the shipping label and drop off at any carrier location</li>
                    <li>Once we receive and inspect the return, your refund will be processed</li>
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {(isCancellable || isReturnable) && (
            <Button 
              onClick={handleSubmit} 
              disabled={!reason || processing}
            >
              {processing ? "Processing..." : isCancellable ? "Confirm Cancellation" : "Request Return"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderCancellation;
