'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminOrderDetails } from '@/hooks/useAdminOrderDetails';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, User, Truck, CreditCard, AlertTriangle } from 'lucide-react';
import { formatMoney } from '@/utils/currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminOrderStatusManagement } from '@/components/admin/orders/AdminOrderStatusManagement';
import { AdminOrderDetailDTO, OrderStatus, AdminPaymentStatus } from '@/types/admin-order.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const { order, loading, error, refetch } = useAdminOrderDetails(orderId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          <p className="font-semibold">Error</p>
          <p>{error || 'Order not found'}</p>
        </div>
        <div className="mt-4 flex gap-2">
          {refetch && (
            <Button onClick={() => refetch()} variant="default">
              Try Again
            </Button>
          )}
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Financials */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, idx) => (
                      <TableRow key={`${item.productId}-${idx}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-slate-100 rounded" />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {item.productId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatMoney(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatMoney(item.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatMoney(order.financials.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping Fee</span>
                  <span>{formatMoney(order.financials.shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatMoney(order.financials.taxTotal)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Order Total</span>
                  <span>{formatMoney(order.financials.orderTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.lifecycle.cancellation && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Cancellation Details
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Reason:</span>
                  <span>{order.lifecycle.cancellation.reason || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cancelled At:</span>
                  <span>
                    {order.lifecycle.cancellation.cancelledAt
                      ? new Date(order.lifecycle.cancellation.cancelledAt).toLocaleString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Cancelled By:</span>
                  <span>{order.lifecycle.cancellation.cancelledBy || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Customer & Shipping & Fulfillment */}
        <div className="space-y-6">
          <AdminOrderStatusManagement order={order} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Snapshot
              </CardTitle>
              <CardDescription>Frozen at time of order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{order.customer.phone || 'N/A'}</p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">Account ID</p>
                <p className="font-mono text-xs">{order.customer.id}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Details
              </CardTitle>
              <CardDescription>Frozen at time of order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Recipient</p>
                <p className="font-medium">{order.shipping.recipientName}</p>
              </div>
              {order.shipping.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.shipping.phone}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <div className="font-medium">
                  <p>{order.shipping.street}</p>
                  <p>
                    {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}
                  </p>
                  <p>{order.shipping.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Fulfillment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carrier:</span>
                <span className="font-medium">{order.lifecycle.fulfillment?.carrier || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tracking:</span>
                <span className="font-medium">
                  {order.lifecycle.fulfillment?.trackingNumber || 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipped:</span>
                <span className="font-medium">
                  {order.lifecycle.fulfillment?.shippedAt
                    ? new Date(order.lifecycle.fulfillment.shippedAt).toLocaleString()
                    : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivered:</span>
                <span className="font-medium">
                  {order.lifecycle.fulfillment?.deliveredAt
                    ? new Date(order.lifecycle.fulfillment.deliveredAt).toLocaleString()
                    : 'Pending'}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Meta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="font-medium">{order.payment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-xs truncate max-w-[150px]">{order.payment.transactionId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid At:</span>
                <span className="font-medium">
                  {order.payment.paidAt ? new Date(order.payment.paidAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              {order.payment.refundedAt && (
                <>
                  <div className="flex justify-between text-red-600">
                    <span className="text-red-500">Refunded At:</span>
                    <span className="font-medium">
                      {new Date(order.payment.refundedAt).toLocaleString()}
                    </span>
                  </div>
                  {order.payment.refundAmount !== undefined && (
                    <div className="flex justify-between text-red-600">
                      <span className="text-red-500">Refund Amount:</span>
                      <span className="font-medium">
                        {formatMoney(order.payment.refundAmount)}
                      </span>
                    </div>
                  )}
                  {order.payment.refundId && (
                    <div className="flex justify-between text-red-600">
                      <span className="text-red-500">Refund ID:</span>
                      <span className="font-mono text-xs truncate max-w-[150px]">
                        {order.payment.refundId}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: OrderStatus }) {
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  
  switch (status) {
    case 'CONFIRMED':
      variant = 'default';
      break;
    case 'PROCESSING':
    case 'SHIPPED':
      variant = 'secondary';
      break;
    case 'DELIVERED':
      variant = 'outline'; // typically green if custom tailwind class
      break;
    case 'CANCELLED':
      variant = 'destructive';
      break;
  }
  
  return <Badge variant={variant}>{status}</Badge>;
}

function PaymentBadge({ status }: { status: AdminPaymentStatus }) {
  if (status === 'paid') {
    return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Paid</Badge>;
  }
  if (status === 'refunded') {
    return <Badge variant="destructive">Refunded</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}
