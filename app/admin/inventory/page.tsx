"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAdminInventory } from "@/hooks/useAdminInventory";
import type {
  AdminInventoryItemDTO,
  AdminInventoryStatusFilter,
  AdminInventorySortOption,
  AdminInventoryStockStateDTO,
} from "@/types/inventory.types";
import { formatMoney } from "@/utils/currency";
import { InventoryAdjustmentDialog } from "./InventoryAdjustmentDialog";
import { InventoryHistoryDialog } from "./InventoryHistoryDialog";

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
  Boxes,
  ImageIcon,
  MoreHorizontal,
  History,
  Settings2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminInventoryPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminInventoryStatusFilter>("all");
  const [sortOption, setSortOption] = useState<AdminInventorySortOption>("updated_desc");

  const [adjustItem, setAdjustItem] = useState<AdminInventoryItemDTO | null>(null);
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);

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
  }, [statusFilter, sortOption]);

  const queryParams = useMemo(() => {
    const params: Parameters<typeof useAdminInventory>[0] = {
      page,
      limit,
      sort: sortOption,
    };
    if (debouncedSearch) params.q = debouncedSearch;
    if (statusFilter !== "all") params.status = statusFilter;
    return params;
  }, [page, limit, debouncedSearch, statusFilter, sortOption]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminInventory(queryParams);

  const totalPages = data?.pagination?.totalPages ?? 1;

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setSortOption("updated_desc");
    setPage(1);
  };

  const getStockStateBadge = (stockState: AdminInventoryStockStateDTO) => {
    switch (stockState.state) {
      case "IN_STOCK":
        return (
          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-50">
            {stockState.label}
          </Badge>
        );
      case "LOW_STOCK":
        return (
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-50">
            {stockState.label}
          </Badge>
        );
      case "OUT_OF_STOCK":
        return (
          <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 hover:bg-red-50">
            {stockState.label}
          </Badge>
        );
      case "NOT_TRACKED":
        return (
          <Badge variant="secondary" className="text-muted-foreground font-normal">
            {stockState.label}
          </Badge>
        );
    }
  };

  const getTrackingBadge = (trackInventory: boolean) => {
    return trackInventory ? (
      <Badge variant="outline" className="font-normal text-xs border-muted-foreground/30">
        Tracked
      </Badge>
    ) : (
      <Badge variant="secondary" className="font-normal text-xs text-muted-foreground">
        Untracked
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Track real-time stock levels, reservations, sold units, and inventory tracking.
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
          <CardTitle>All Inventory</CardTitle>
          <CardDescription>
            {data?.pagination?.totalItems !== undefined
              ? `${data.pagination.totalItems} inventory item${data.pagination.totalItems !== 1 ? "s" : ""} total`
              : "Loading inventory levels..."}
          </CardDescription>
        </CardHeader>

        {/* Filters and Search Bar */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="admin-inventory-search"
              type="text"
              placeholder="Search by product name or slug..."
              className="pl-9 pr-9"
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as AdminInventoryStatusFilter)}
            >
              <SelectTrigger id="admin-inventory-status-filter" className="w-[155px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock States</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="not_tracked">Not Tracked</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortOption}
              onValueChange={(val) => setSortOption(val as AdminInventorySortOption)}
            >
              <SelectTrigger id="admin-inventory-sort" className="w-[170px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_desc">Recently Updated</SelectItem>
                <SelectItem value="updated_asc">Oldest Updated</SelectItem>
                <SelectItem value="available_desc">Available (High-Low)</SelectItem>
                <SelectItem value="available_asc">Available (Low-High)</SelectItem>
                <SelectItem value="reserved_desc">Reserved (High-Low)</SelectItem>
                <SelectItem value="sold_desc">Sold (High-Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent>
          {isError ? (
            <div className="rounded-md border border-destructive/50 p-6 text-center text-destructive">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p className="font-medium">Failed to load inventory</p>
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
                <div key={i} className="flex items-center gap-4 py-2">
                  <Skeleton className="h-10 w-10 rounded shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[220px]" />
                    <Skeleton className="h-3 w-[140px]" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : !data?.inventory?.length ? (
            <div className="text-center py-12">
              <Boxes className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">No inventory records found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {statusFilter !== "all" || debouncedSearch
                  ? "No inventory records match the current search or filters."
                  : "No inventory records exist in the database."}
              </p>
              {(statusFilter !== "all" || debouncedSearch) && (
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
                    <TableHead className="min-w-[220px]">Product</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Reserved</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead className="text-center">Track Inventory</TableHead>
                    <TableHead>Stock State</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.inventory.map((item: AdminInventoryItemDTO) => {
                    const product = item.product;
                    return (
                      <TableRow key={item._id}>
                        {/* Product Column */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center border">
                              {product?.primaryImage ? (
                                <img
                                  src={product.primaryImage.url}
                                  alt={product.primaryImage.alt || product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="max-w-[220px]">
                              <p
                                className="font-medium truncate"
                                title={product?.name ?? `Product ${item.productId}`}
                              >
                                {product?.name ?? `Product: ${item.productId.slice(-8)}`}
                              </p>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="font-mono truncate" title={product?.slug}>
                                  {product?.slug ?? item.productId}
                                </span>
                                {product?.price !== undefined && (
                                  <>
                                    <span>&middot;</span>
                                    <span className="tabular-nums">
                                      {formatMoney(product.price)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Available (Integer count, not currency) */}
                        <TableCell className="text-right font-medium tabular-nums">
                          {item.available}
                        </TableCell>

                        {/* Reserved (Integer count, active reservation model) */}
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {item.reserved}
                        </TableCell>

                        {/* Sold (Integer count) */}
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {item.sold}
                        </TableCell>

                        {/* Track Inventory */}
                        <TableCell className="text-center">
                          {getTrackingBadge(item.trackInventory)}
                        </TableCell>

                        {/* Stock State */}
                        <TableCell>
                          {getStockStateBadge(item.stockState)}
                        </TableCell>

                        {/* Updated Date */}
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(item.updatedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setAdjustItem(item)}>
                                <Settings2 className="mr-2 h-4 w-4" />
                                Adjust Stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setHistoryProductId(item.productId)}>
                                <History className="mr-2 h-4 w-4" />
                                View History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      {/* Dialogs */}
      <InventoryAdjustmentDialog
        item={adjustItem}
        open={!!adjustItem}
        onOpenChange={(open) => !open && setAdjustItem(null)}
      />

      <InventoryHistoryDialog
        productId={historyProductId}
        open={!!historyProductId}
        onOpenChange={(open) => !open && setHistoryProductId(null)}
      />
    </div>
  );
}
