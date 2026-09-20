'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AdminOrderDetailDTO, OrderStatus } from '@/types/admin-order.types';
import { useUpdateAdminOrderStatus, useCancelAdminOrder } from '@/hooks/useAdminOrders';
import { formatMoney } from '@/utils/currency';
import { Activity, AlertTriangle, XCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Props {
  order: AdminOrderDetailDTO;
}

export function AdminOrderStatusManagement({ order }: Props) {
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateAdminOrderStatus();
  const { mutate: cancelOrder, isPending: isCancelling, error: cancelError } = useCancelAdminOrder();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    CONFIRMED: ['PROCESSING'],
    PROCESSING: ['SHIPPED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  const availableTransitions = validTransitions[order.status] || [];
  const isCancellable = ['CONFIRMED', 'PROCESSING'].includes(order.status);
  const isPaid = order.payment.status === 'paid';

  const handleStatusUpdate = () => {
    if (!selectedStatus) return;
    updateStatus(
      { orderId: order.id, status: selectedStatus },
      {
        onSuccess: () => {
          setSelectedStatus('');
        },
      }
    );
  };

  const handleCancelOrder = () => {
    cancelOrder(
      { orderId: order.id, reason: cancelReason.trim() || undefined },
      {
        onSuccess: () => {
          setIsCancelDialogOpen(false);
          setCancelReason('');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Status Management
        </CardTitle>
        <CardDescription>Transition operational order status or cancel order</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Operational Status Transitions */}
        {availableTransitions.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val as OrderStatus)}
                disabled={isUpdating || isCancelling}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new status..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || isUpdating || isCancelling}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Operational status changes are atomic and immutable.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {order.status === 'CANCELLED'
              ? 'This order is CANCELLED. No further operational transitions are allowed.'
              : order.status === 'DELIVERED'
              ? 'This order has been DELIVERED. Terminal state reached.'
              : `No further operational transitions available from ${order.status}.`}
          </p>
        )}

        {/* Cancellation Section */}
        {isCancellable && (
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Order Cancellation
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPaid
                    ? 'Cancelling will issue a full refund and restock items.'
                    : 'Cancelling will restock items back to inventory.'}
                </p>
              </div>

              <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={isUpdating || isCancelling}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    Cancel Order
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Cancel Order {order.orderNumber}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2 text-left pt-2">
                      <span>
                        Are you sure you want to cancel this order? This action cannot be undone.
                      </span>
                      {isPaid ? (
                        <span className="block font-medium text-foreground bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded border border-amber-200 dark:border-amber-800 text-xs">
                          A full refund of{' '}
                          <strong>
                            {formatMoney(order.financials.orderTotal)}
                          </strong>{' '}
                          will be automatically initiated through the payment gateway, and all order
                          items will be restocked to inventory.
                        </span>
                      ) : (
                        <span className="block text-xs text-muted-foreground">
                          This unpaid order will be marked cancelled and its items returned to
                          stock.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="space-y-2 py-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Cancellation Reason (Optional)
                    </label>
                    <Textarea
                      placeholder="e.g., Customer requested cancellation before shipping"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      maxLength={500}
                      className="text-sm h-20"
                      disabled={isCancelling}
                    />
                  </div>

                  {cancelError && (
                    <p className="text-xs text-destructive font-medium">
                      {cancelError.message || 'Failed to cancel order'}
                    </p>
                  )}

                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isCancelling}>Keep Order</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleCancelOrder}
                      disabled={isCancelling}
                    >
                      {isCancelling ? 'Processing Cancellation...' : 'Confirm Cancellation'}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        {/* Cancellation Details if already Cancelled */}
        {order.status === 'CANCELLED' && order.lifecycle?.cancellation && (
          <div className="pt-3 border-t text-xs space-y-1 bg-muted/40 p-3 rounded-md">
            <p className="font-medium text-foreground">Cancellation Summary</p>
            {order.lifecycle.cancellation.reason && (
              <p className="text-muted-foreground">
                <span className="font-medium">Reason:</span> {order.lifecycle.cancellation.reason}
              </p>
            )}
            {order.lifecycle.cancellation.cancelledAt && (
              <p className="text-muted-foreground">
                <span className="font-medium">Cancelled:</span>{' '}
                {new Date(order.lifecycle.cancellation.cancelledAt).toLocaleString()}
              </p>
            )}
            {order.payment.refundId && (
              <p className="text-muted-foreground">
                <span className="font-medium">Refund ID:</span>{' '}
                <span className="font-mono">{order.payment.refundId}</span>
              </p>
            )}
          </div>
        )}

        {/* Status History */}
        {order.history && order.history.length > 0 && (
          <div className="pt-4 border-t space-y-3">
            <p className="text-sm font-medium">Transition History</p>
            <div className="space-y-2">
              {[...order.history]
                .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime())
                .map((entry, idx) => (
                <div key={idx} className="text-xs flex justify-between">
                  <span>
                    {entry.previousStatus} → <strong>{entry.newStatus}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(entry.changedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

