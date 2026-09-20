"use client";

import React, { useState, useMemo } from "react";
import { useAdminProducts, useCreateProduct, useArchiveProduct } from "@/hooks/useAdminProducts";
import { AdminProductCardDTO, ProductVisibility, CreateProductPayload } from "@/types/product.types";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  Plus,
  RefreshCw,
  Search,
  X,
  MoreHorizontal,
  Edit2,
  Archive,
  ImageIcon,
  AlertCircle,
  Tags,
  Star,
} from "lucide-react";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Visibility and featured are now sent to the backend
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | ProductVisibility>("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "not_featured">("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductCardDTO | null>(null);

  const { toast } = useToast();
  const createMutation = useCreateProduct();
  const archiveMutation = useArchiveProduct();

  const limit = 20;

  // Debounce search — reset page on new search
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [visibilityFilter, featuredFilter]);

  const queryParams = useMemo(() => {
    const params: Parameters<typeof useAdminProducts>[0] = {
      page,
      limit,
      sort: "newest",
    };
    if (debouncedSearch) params.q = debouncedSearch;
    if (visibilityFilter !== "all") params.visibility = visibilityFilter;
    if (featuredFilter === "featured") params.featured = true;
    if (featuredFilter === "not_featured") params.featured = false;
    return params;
  }, [page, limit, debouncedSearch, visibilityFilter, featuredFilter]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminProducts(queryParams);

  const totalPages = data?.pagination?.totalPages ?? 1;

  const handleResetFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setVisibilityFilter("all");
    setFeaturedFilter("all");
    setPage(1);
  };

  const handleCreateSubmit = async (data: CreateProductPayload) => {
    try {
      await createMutation.mutateAsync(data);
      toast({ title: "Product created", description: `Draft "${data.name}" created successfully.` });
      setIsCreateOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to create product",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
      throw err;
    }
  };

  const handleEditSubmit = async (data: CreateProductPayload) => {
    if (!editingProduct) return;
    // Note: edit submit is now handled inside ProductForm via useUpdateProduct directly.
    // This handler is still required by the ProductForm onSubmit prop.
    toast({ title: "Product updated", description: `"${data.name}" updated successfully.` });
    setEditingProduct(null);
  };

  const handleArchiveFromDropdown = async (product: AdminProductCardDTO) => {
    try {
      await archiveMutation.mutateAsync(product._id);
      toast({ title: "Product archived", description: `"${product.name}" has been archived.` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Archive failed",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
  };

  const getVisibilityBadge = (visibility: ProductVisibility) => {
    switch (visibility) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Published
          </Badge>
        );
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "hidden":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200"
          >
            Hidden
          </Badge>
        );
      case "archived":
        return <Badge variant="destructive">Archived</Badge>;
    }
  };

  const getAvailabilityBadge = (product: AdminProductCardDTO) => {
    const { status, label } = product.availability;
    switch (status) {
      case "IN_STOCK":
        return (
          <Badge variant="outline" className="text-green-600 border-green-200">
            {label}
          </Badge>
        );
      case "LOW_STOCK":
        return (
          <Badge
            variant="outline"
            className="text-orange-600 border-orange-200"
          >
            {label}
          </Badge>
        );
      case "OUT_OF_STOCK":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200">
            {label}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog, pricing, and inventory.
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
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            {data?.pagination?.totalItems !== undefined
              ? `${data.pagination.totalItems} product${data.pagination.totalItems !== 1 ? "s" : ""} total`
              : "Loading products..."}
          </CardDescription>
        </CardHeader>

        {/* Filters */}
        <div className="px-6 pb-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="admin-products-search"
              type="text"
              placeholder="Search by name, tags, materials..."
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
              value={visibilityFilter}
              onValueChange={(val) =>
                setVisibilityFilter(val as "all" | ProductVisibility)
              }
            >
              <SelectTrigger id="admin-products-visibility-filter" className="w-[145px]">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={featuredFilter}
              onValueChange={(val) =>
                setFeaturedFilter(val as "all" | "featured" | "not_featured")
              }
            >
              <SelectTrigger id="admin-products-featured-filter" className="w-[145px]">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Featured</SelectItem>
                <SelectItem value="featured">Featured Only</SelectItem>
                <SelectItem value="not_featured">Not Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CardContent>
          {isError ? (
            <div className="rounded-md border border-destructive/50 p-6 text-center text-destructive">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              <p className="font-medium">Failed to load products</p>
              <p className="text-sm opacity-80 mb-4">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-3 w-[180px]" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : !data?.products?.length ? (
            <div className="text-center py-12">
              <Tags className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {visibilityFilter !== "all" ||
                featuredFilter !== "all" ||
                debouncedSearch
                  ? "No products match the current filters."
                  : "No products have been created yet."}
              </p>
              {(visibilityFilter !== "all" ||
                featuredFilter !== "all" ||
                debouncedSearch) && (
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
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="text-center">Featured</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.products.map((product) => {
                    const isArchived = product.visibility === "archived";
                    return (
                    <TableRow 
                      key={product._id}
                      className={isArchived ? "opacity-60 bg-muted/30 hover:bg-muted/50" : ""}
                    >
                      {/* Product */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center border ${isArchived ? "grayscale" : ""}`}>
                            {product.primaryImage ? (
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
                              title={product.name}
                            >
                              {product.name}
                            </p>
                            <p
                              className="text-xs text-muted-foreground font-mono truncate"
                              title={product.slug}
                            >
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        {product.category ? (
                          <Badge variant="outline" className="font-normal">
                            {product.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium tabular-nums">
                            {formatMoney(product.salePrice ?? product.price)}
                          </span>
                          {product.salePrice !== undefined && (
                            <span className="text-xs text-muted-foreground line-through tabular-nums">
                              {formatMoney(product.price)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Visibility — real value from backend */}
                      <TableCell>
                        {getVisibilityBadge(product.visibility)}
                      </TableCell>

                      {/* Featured */}
                      <TableCell className="text-center">
                        {product.featured ? (
                          <Star className={`h-4 w-4 mx-auto ${isArchived ? "fill-muted-foreground text-muted-foreground" : "fill-yellow-400 text-yellow-400"}`} />
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>

                      {/* Inventory */}
                      <TableCell>
                        {getAvailabilityBadge(product)}
                      </TableCell>

                      {/* Updated date */}
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              aria-label={`Actions for ${product.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                              <Edit2 className="mr-2 h-4 w-4" />
                              {isArchived ? "View Details" : "Edit / Manage"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              disabled={isArchived || archiveMutation.isPending}
                              className="text-destructive focus:bg-destructive/10"
                              onClick={() => handleArchiveFromDropdown(product)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive Product
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
                {data?.pagination?.totalItems ?? 0} products
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
            <DialogDescription>
              Create a new product. It will be saved as a draft initially.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreateSubmit}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details, images, and lifecycle state.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={editingProduct}
              onSubmit={handleEditSubmit}
              onArchived={() => setEditingProduct(null)}
              isLoading={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
