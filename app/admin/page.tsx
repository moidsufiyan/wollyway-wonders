"use client";

import React from "react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Package, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/utils/currency";

const getStatusBadgeVariant = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'DELIVERED':
      return 'default';
    case 'SHIPPED':
      return 'secondary';
    case 'PROCESSING':
    case 'CONFIRMED':
      return 'outline';
    case 'CANCELLED':
    case 'REFUNDED':
      return 'destructive';
    default:
      return 'outline';
  }
};

const formatStatusLabel = (status: string) => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your store's performance.
          </p>
        </div>

        <Card className="border-destructive/50 max-w-2xl">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <CardTitle className="text-lg text-destructive">Failed to load dashboard data</CardTitle>
              <CardDescription>
                {error instanceof Error ? error.message : "An unexpected error occurred while fetching dashboard metrics."}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your store's performance.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Products KPI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.products.total ?? 0}</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Published:</span>
                <span className="font-medium text-foreground">{data?.products.published ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Draft:</span>
                <span className="font-medium text-foreground">{data?.products.draft ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Hidden:</span>
                <span className="font-medium text-foreground">{data?.products.hidden ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Archived:</span>
                <span className="font-medium text-foreground">{data?.products.archived ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders KPI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.orders.total ?? 0}</div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Confirmed:</span>
                <Badge variant="outline" className="font-normal">{data?.orders.confirmed ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Processing:</span>
                <Badge variant="outline" className="font-normal">{data?.orders.processing ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipped:</span>
                <Badge variant="secondary" className="font-normal">{data?.orders.shipped ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivered:</span>
                <Badge variant="default" className="font-normal">{data?.orders.delivered ?? 0}</Badge>
              </div>
              <div className="flex justify-between items-center col-span-2">
                <span>Cancelled:</span>
                <Badge variant="destructive" className="font-normal">{data?.orders.cancelled ?? 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue KPI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.revenue?.total !== undefined ? formatMoney(data.revenue.total) : '₹0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Includes completed payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders received by the store</CardDescription>
          </div>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {!data?.recentOrders || data.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <ShoppingCart className="h-8 w-8 mb-4 text-muted-foreground/50" />
              <p>No recent orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.customer?.name || 'Unknown'}</span>
                          <span className="text-xs text-muted-foreground">{order.customer?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {formatStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.itemCount}</TableCell>
                      <TableCell className="text-right">{formatMoney(order.orderTotal)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
