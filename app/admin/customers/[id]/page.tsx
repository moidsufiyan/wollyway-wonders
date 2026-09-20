"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminCustomerDetail, useUpdateAdminCustomerStatus } from "@/hooks/useAdminCustomers";
import { formatMoney } from "@/utils/currency";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AdminCustomerStatusUpdateDTO } from "@/types/admin-customer.types";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  const { data: customer, isLoading, isError, error } = useAdminCustomerDetail(id);
  const updateStatusMutation = useUpdateAdminCustomerStatus();

  const handleStatusChange = (status: string) => {
    if (!customer || status === customer.status) return;
    
    if (status === 'deactivated' && !window.confirm('Are you sure you want to deactivate this customer? This action will permanently scrub their PII (name, email, phone, addresses) and cannot be undone.')) {
      return;
    }

    updateStatusMutation.mutate(
      { id, status: status as AdminCustomerStatusUpdateDTO['status'] },
      {
        onSuccess: () => {
          toast({ title: 'Customer status updated successfully' });
        },
        onError: (err: any) => {
          toast({
            title: 'Failed to update status',
            description: err.response?.data?.message || err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-red-500 gap-4">
        <AlertCircle className="h-8 w-8" />
        <p>Error loading customer: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <Button variant="outline" asChild>
          <Link href="/admin/customers">Back to Customers</Link>
        </Button>
      </div>
    );
  }

  const isDeactivated = customer.status === 'deactivated';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Select
            value={customer.status}
            onValueChange={handleStatusChange}
            disabled={isDeactivated || updateStatusMutation.isPending}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active" disabled={isDeactivated}>Active</SelectItem>
              <SelectItem value="suspended" disabled={isDeactivated}>Suspended</SelectItem>
              <SelectItem value="deactivated" disabled={isDeactivated}>Deactivated</SelectItem>
            </SelectContent>
          </Select>
          {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">ID</div>
              <div className="font-mono text-sm">{customer.id}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <div>{customer.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Email</div>
              <div>{customer.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Phone</div>
              <div>{customer.phone || 'Not provided'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Joined</div>
              <div>{format(new Date(customer.createdAt), "PPP")}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Login</div>
              <div>{customer.lastLogin ? format(new Date(customer.lastLogin), "PPP p") : 'Never'}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
              <div className="text-2xl font-bold">{customer.orderCount}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Total Spent (Paid)</div>
              <div className="text-2xl font-bold">{formatMoney(customer.totalSpent)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Last Order Date</div>
              <div>{customer.lastOrderDate ? format(new Date(customer.lastOrderDate), "PPP p") : 'No orders'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent orders.</p>
          ) : (
            <div className="divide-y border rounded-md">
              {customer.recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">Order #{order.orderId}</div>
                    <div className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "PPP p")}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm capitalize">{order.status.toLowerCase()}</div>
                    <div className="font-semibold">{formatMoney(order.total)}</div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
