"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import type {
  AdminOrderQueryParams,
  AdminOrderSortOption,
  AdminPaymentStatus,
  OrderStatus,
} from "@/types/admin-order.types";
import { formatMoney } from "@/utils/currency";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Search,
  X,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<AdminPaymentStatus | "all">("all");
  const [sortOption, setSortOption] = useState<AdminOrderSortOption>("created_desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const limit = 20;

  // Debounce search input — reset page to 1 on query change
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filter or sort changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, paymentStatusFilter, sortOption, fromDate, toDate]);

  const queryParams = useMemo(() => {
    const params: AdminOrderQueryParams = {
      page,
      limit,
      sort: sortOption,
    };
    if (debouncedSearch) params.q = debouncedSearch;
    if (statusFilter !== "all") params.status = statusFilter;
    if (paymentStatusFilter !== "all") params.paymentStatus = paymentStatusFilter;

    // Timezone safe boundaries for date-only inputs
    if (fromDate) {
      params.from = new Date(`${fromDate}T00:00:00`).toISOString();
    }
    if (toDate) {
      params.to = new Date(`${toDate}T23:59:59.999`).toISOString();
    }

    return params;
  }, [page, limit, debouncedSearch, statusFilter, paymentStatusFilter, sortOption, fromDate, toDate]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminOrders(queryParams);

  const totalPages = data?.pagination?.totalPages ?? 1;

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setSortOption("created_desc");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">Delivered</Badge>;
      case "SHIPPED":
        return <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">Shipped</Badge>;
      case "PROCESSING":
        return <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">Processing</Badge>;
      case "CONFIRMED":
        return <Badge variant="outline" className="text-indigo-700 bg-indigo-50 border-indigo-200">Confirmed</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: AdminPaymentStatus) => {
    switch (status) {
      case "paid":
        return <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200">Paid</Badge>;
      case "refunded":
        return <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and track fulfillment status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {data?.pagination?.totalItems !== undefined
              ? `${data.pagination.totalItems} order${data.pagination.totalItems !== 1 ? "s" : ""} total`
              : "Loading orders..."}
          </CardDescription>
        </CardHeader>

        {/* Filters and Search Bar */}
        <div className="px-6 pb-4 flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="admin-orders-search"
              type="text"
              placeholder="Search order #, customer name or email..."
              className="pl-9 pr-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as OrderStatus | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Fulfillment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentStatusFilter} onValueChange={(val) => setPaymentStatusFilter(val as AdminPaymentStatus | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOption} onValueChange={(val) => setSortOption(val as AdminOrderSortOption)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest First</SelectItem>
                <SelectItem value="created_asc">Oldest First</SelectItem>
                <SelectItem value="total_desc">Total (High-Low)</SelectItem>
                <SelectItem value="total_asc">Total (Low-High)</SelectItem>
                <SelectItem value="orderNumber_desc">Order # (High-Low)</SelectItem>
                <SelectItem value="orderNumber_asc">Order # (Low-High)</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[130px] h-10 px-3"
                title="From Date"
              />
              <span className="text-muted-foreground text-sm">-</span>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[130px] h-10 px-3"
                title="To Date"
              />
            </div>
          </div>
        </div>

        <CardContent>
          {isError ? (
            <div className="rounded-md border border-destructive/50 p-6 text-center text-destructive">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p className="font-medium">Failed to load orders</p>
              <p className="text-sm opacity-80 mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[160px]" />
                    <Skeleton className="h-3 w-[220px]" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : !data?.orders?.length ? (
            <div className="text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">No orders found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {statusFilter !== "all" || paymentStatusFilter !== "all" || debouncedSearch || fromDate || toDate
                  ? "No orders match the current search or filters."
                  : "No orders exist in the database."}
              </p>
              {(statusFilter !== "all" || paymentStatusFilter !== "all" || debouncedSearch || fromDate || toDate) && (
                <Button variant="outline" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-sm hover:underline hover:text-primary">
                          {order.orderNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</p>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{order.customer.displayName}</p>
                        <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {formatMoney(order.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getPaymentBadge(order.paymentStatus)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/orders/${order.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} &middot;{" "}
                {data?.pagination?.totalItems ?? 0} items
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
