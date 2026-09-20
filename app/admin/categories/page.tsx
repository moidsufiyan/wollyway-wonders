"use client";

import React, { useState, useMemo } from "react";
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useArchiveCategory,
} from "@/hooks/useAdminCategories";
import { CategoryDTO, CategoryStatus } from "@/types/category.types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Tags,
  Plus,
  RefreshCw,
  Search,
  X,
  MoreHorizontal,
  Edit2,
  Star,
  Eye,
  EyeOff,
  Archive,
  AlertCircle,
  Lock,
  ImageIcon,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const { toast } = useToast();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CategoryStatus>("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured">("all");

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
  const [categoryToArchive, setCategoryToArchive] = useState<CategoryDTO | null>(null);

  // Form State for Create Dialog
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    status: "active" as CategoryStatus,
    sortOrder: 0,
    featured: false,
    imageUrl: "",
    imageAlt: "",
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  // Form State for Edit Dialog
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status: "active" as CategoryStatus,
    sortOrder: 0,
    featured: false,
    imageUrl: "",
    imageAlt: "",
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // 1. Base Query: Used to compute the authoritative featured count across all non-archived categories
  const { data: baseCategories } = useAdminCategories();
  const actualFeaturedCount = useMemo(() => {
    return (
      baseCategories?.filter(
        (cat) => cat.status !== "archived" && cat.featured === true
      ).length ?? 0
    );
  }, [baseCategories]);

  // 2. Active Query: If filtering for 'archived', fetch archived; otherwise fetch default active+hidden
  const queryParams = useMemo(() => {
    if (statusFilter === "archived") return { status: "archived" as CategoryStatus };
    if (statusFilter === "active") return { status: "active" as CategoryStatus };
    if (statusFilter === "hidden") return { status: "hidden" as CategoryStatus };
    return undefined;
  }, [statusFilter]);

  const {
    data: categories,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminCategories(queryParams);

  // Mutations
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const archiveMutation = useArchiveCategory();

  // Client-side filtering on search query & featured filter
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const matchesFeatured =
        featuredFilter === "all" || (featuredFilter === "featured" && cat.featured);

      return matchesSearch && matchesFeatured;
    });
  }, [categories, searchQuery, featuredFilter]);

  // --- Handlers: Quick Status & Featured Toggles ---
  const handleToggleStatus = (category: CategoryDTO) => {
    const nextStatus: CategoryStatus =
      category.status === "active" ? "hidden" : "active";

    updateMutation.mutate(
      {
        id: category._id,
        data: { status: nextStatus },
      },
      {
        onSuccess: () => {
          toast({
            title: "Status updated",
            description: `Category "${category.name}" is now ${nextStatus}.`,
          });
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Failed to update status",
            description: err instanceof Error ? err.message : "An error occurred.",
          });
        },
      }
    );
  };

  const handleToggleFeatured = (category: CategoryDTO) => {
    const nextFeatured = !category.featured;

    updateMutation.mutate(
      {
        id: category._id,
        data: { featured: nextFeatured },
      },
      {
        onSuccess: () => {
          toast({
            title: nextFeatured ? "Category featured" : "Category unfeatured",
            description: nextFeatured
              ? `"${category.name}" is now featured on the homepage.`
              : `"${category.name}" is no longer featured.`,
          });
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Failed to toggle featured status",
            description: err instanceof Error ? err.message : "An error occurred.",
          });
        },
      }
    );
  };

  // --- Handlers: Create Category ---
  const validateCreateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (createForm.name.trim().length < 2 || createForm.name.trim().length > 50) {
      errs.name = "Name must be between 2 and 50 characters.";
    }
    if (createForm.description.trim().length < 10 || createForm.description.trim().length > 500) {
      errs.description = "Description must be between 10 and 500 characters.";
    }
    if (createForm.imageUrl.trim() && !/^https?:\/\/.+/.test(createForm.imageUrl.trim())) {
      errs.imageUrl = "Image URL must be a valid URL starting with http:// or https://";
    }
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    createMutation.mutate(
      {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        status: createForm.status,
        sortOrder: Number(createForm.sortOrder) || 0,
        featured: createForm.featured,
        image: createForm.imageUrl.trim()
          ? {
              url: createForm.imageUrl.trim(),
              alt: createForm.imageAlt.trim() || null,
            }
          : undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: "Category created",
            description: `Category "${createForm.name.trim()}" has been created successfully.`,
          });
          setIsCreateOpen(false);
          setCreateForm({
            name: "",
            description: "",
            status: "active",
            sortOrder: 0,
            featured: false,
            imageUrl: "",
            imageAlt: "",
          });
          setCreateErrors({});
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Failed to create category",
            description: err instanceof Error ? err.message : "An error occurred.",
          });
        },
      }
    );
  };

  // --- Handlers: Edit Category ---
  const openEditDialog = (category: CategoryDTO) => {
    setEditingCategory(category);
    setEditForm({
      name: category.name,
      description: category.description,
      status: category.status,
      sortOrder: category.sortOrder,
      featured: category.featured,
      imageUrl: category.image?.url ?? "",
      imageAlt: category.image?.alt ?? "",
    });
    setEditErrors({});
  };

  const validateEditForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (editForm.name.trim().length < 2 || editForm.name.trim().length > 50) {
      errs.name = "Name must be between 2 and 50 characters.";
    }
    if (editForm.description.trim().length < 10 || editForm.description.trim().length > 500) {
      errs.description = "Description must be between 10 and 500 characters.";
    }
    if (editForm.imageUrl.trim() && !/^https?:\/\/.+/.test(editForm.imageUrl.trim())) {
      errs.imageUrl = "Image URL must be a valid URL starting with http:// or https://";
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!validateEditForm()) return;

    updateMutation.mutate(
      {
        id: editingCategory._id,
        data: {
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          status: editForm.status,
          sortOrder: Number(editForm.sortOrder) || 0,
          featured: editForm.featured,
          image: editForm.imageUrl.trim()
            ? {
                url: editForm.imageUrl.trim(),
                alt: editForm.imageAlt.trim() || null,
              }
            : undefined,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Category updated",
            description: `Category "${editForm.name.trim()}" has been updated successfully.`,
          });
          setEditingCategory(null);
          setEditErrors({});
        },
        onError: (err) => {
          toast({
            variant: "destructive",
            title: "Failed to update category",
            description: err instanceof Error ? err.message : "An error occurred.",
          });
        },
      }
    );
  };

  // --- Handlers: Archive Category ---
  const handleArchiveConfirm = () => {
    if (!categoryToArchive) return;

    archiveMutation.mutate(categoryToArchive._id, {
      onSuccess: () => {
        toast({
          title: "Category archived",
          description: `Category "${categoryToArchive.name}" has been archived.`,
        });
        setCategoryToArchive(null);
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Cannot archive category",
          description:
            err instanceof Error
              ? err.message
              : "Failed to archive category. It may contain active products.",
        });
      },
    });
  };

  // Helper for Status Badges
  const renderStatusBadge = (status: CategoryStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
          >
            Active
          </Badge>
        );
      case "hidden":
        return (
          <Badge variant="secondary" className="font-medium">
            Hidden
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="destructive" className="font-medium">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your store&apos;s product categories and catalog hierarchy.
          </p>
        </div>

        <Card className="border-destructive/50 max-w-2xl">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <CardTitle className="text-lg text-destructive">
                Failed to load categories
              </CardTitle>
              <CardDescription>
                {error instanceof Error
                  ? error.message
                  : "An unexpected error occurred while fetching categories."}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
            <Badge
              variant={actualFeaturedCount >= 6 ? "destructive" : "secondary"}
              className="gap-1.5 px-2.5 py-1 text-xs font-semibold"
              title="Authoritative featured category count across all non-archived categories (maximum limit: 6)"
            >
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              Featured: {actualFeaturedCount} / 6
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Manage product categories, sorting hierarchy, visibility, and featured showcases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as "all" | CategoryStatus)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={featuredFilter}
            onValueChange={(val) => setFeaturedFilter(val as "all" | "featured")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Featured" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Showcase</SelectItem>
              <SelectItem value="featured">Featured Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Categories Table / Card */}
      <Card>
        <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredCategories.length}</span>{" "}
            {filteredCategories.length === 1 ? "category" : "categories"}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Tags className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium">No categories found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all" || featuredFilter !== "all"
                  ? "No categories match your active filters. Try adjusting your search query or reset filters."
                  : "Get started by creating your first product category."}
              </p>
              {searchQuery || statusFilter !== "all" || featuredFilter !== "all" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setFeaturedFilter("all");
                  }}
                >
                  Reset Filters
                </Button>
              ) : (
                <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Category</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-center">Sort Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category._id} className="hover:bg-muted/50">
                      {/* Name & Description */}
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted/60 border flex items-center justify-center shrink-0 overflow-hidden">
                            {category.image?.url ? (
                              <img
                                src={category.image.url}
                                alt={category.image.alt || category.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium leading-none truncate max-w-[220px]">
                              {category.name}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Slug */}
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                          {category.slug}
                        </code>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>{renderStatusBadge(category.status)}</TableCell>

                      {/* Featured */}
                      <TableCell>
                        {category.status === "archived" ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(category)}
                            disabled={updateMutation.isPending}
                            className="inline-flex items-center gap-1.5 text-xs rounded-full px-2 py-1 transition-colors hover:bg-muted focus:outline-none"
                            title={
                              category.featured
                                ? "Click to unfeature"
                                : actualFeaturedCount >= 6
                                ? "Limit reached (max 6)"
                                : "Click to feature"
                            }
                          >
                            <Star
                              className={`h-4 w-4 ${
                                category.featured
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                            <span
                              className={
                                category.featured
                                  ? "font-medium text-amber-600 dark:text-amber-400"
                                  : "text-muted-foreground"
                              }
                            >
                              {category.featured ? "Featured" : "No"}
                            </span>
                          </button>
                        )}
                      </TableCell>

                      {/* Sort Order */}
                      <TableCell className="text-center font-mono text-sm">
                        {category.sortOrder}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              aria-label={`Actions for ${category.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(category)}
                              className="gap-2 cursor-pointer"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit Category
                            </DropdownMenuItem>

                            {category.status !== "archived" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(category)}
                                  disabled={updateMutation.isPending}
                                  className="gap-2 cursor-pointer"
                                >
                                  {category.status === "active" ? (
                                    <>
                                      <EyeOff className="h-4 w-4" />
                                      Hide from Catalog
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-4 w-4" />
                                      Make Active
                                    </>
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => handleToggleFeatured(category)}
                                  disabled={updateMutation.isPending}
                                  className="gap-2 cursor-pointer"
                                >
                                  <Star className="h-4 w-4" />
                                  {category.featured ? "Unfeature" : "Feature on Homepage"}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setCategoryToArchive(category)}
                                  className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                                >
                                  <Archive className="h-4 w-4" />
                                  Archive Category
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- CREATE CATEGORY DIALOG --- */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new catalog category. A unique URL slug will be automatically generated.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="create-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="create-name"
                  placeholder="e.g., Merino Sweaters"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
                {createErrors.name && (
                  <p className="text-xs text-destructive">{createErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="create-description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="create-description"
                  placeholder="Handcrafted wool garments crafted with premium grade merino fibers."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  rows={3}
                  required
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{createErrors.description ? (
                    <span className="text-destructive">{createErrors.description}</span>
                  ) : "Minimum 10 characters."}</span>
                  <span>{createForm.description.length}/500</span>
                </div>
              </div>

              {/* Status & Sort Order */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-status">Initial Status</Label>
                  <Select
                    value={createForm.status}
                    onValueChange={(val) =>
                      setCreateForm({ ...createForm, status: val as CategoryStatus })
                    }
                  >
                    <SelectTrigger id="create-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="create-sortOrder">Sort Order</Label>
                  <Input
                    id="create-sortOrder"
                    type="number"
                    min={0}
                    value={createForm.sortOrder}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        sortOrder: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Featured Switch */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="create-featured" className="text-sm font-medium">
                    Feature on Homepage
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Current featured total: {actualFeaturedCount} / 6
                  </p>
                </div>
                <Switch
                  id="create-featured"
                  checked={createForm.featured}
                  onCheckedChange={(checked) =>
                    setCreateForm({ ...createForm, featured: checked })
                  }
                />
              </div>

              {/* Image URL & Alt Text */}
              <div className="space-y-1.5">
                <Label htmlFor="create-image-url">Image URL (Optional)</Label>
                <Input
                  id="create-image-url"
                  placeholder="https://example.com/category-image.jpg"
                  value={createForm.imageUrl}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, imageUrl: e.target.value })
                  }
                />
                {createErrors.imageUrl && (
                  <p className="text-xs text-destructive">{createErrors.imageUrl}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-image-alt">Image Alt Text (Optional)</Label>
                <Input
                  id="create-image-alt"
                  placeholder="Image description for accessibility"
                  value={createForm.imageAlt}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, imageAlt: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- EDIT CATEGORY DIALOG --- */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category details. Note that category slugs are permanent.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
                {editErrors.name && (
                  <p className="text-xs text-destructive">{editErrors.name}</p>
                )}
              </div>

              {/* Slug (Immutable) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-slug" className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    Slug
                  </Label>
                  <span className="text-xs text-muted-foreground">Immutable</span>
                </div>
                <Input
                  id="edit-slug"
                  value={editingCategory?.slug ?? ""}
                  disabled
                  className="bg-muted text-muted-foreground cursor-not-allowed font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Slug is permanent after creation to protect SEO and URL integrity.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  required
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{editErrors.description ? (
                    <span className="text-destructive">{editErrors.description}</span>
                  ) : "Minimum 10 characters."}</span>
                  <span>{editForm.description.length}/500</span>
                </div>
              </div>

              {/* Status & Sort Order */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(val) =>
                      setEditForm({ ...editForm, status: val as CategoryStatus })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-sortOrder">Sort Order</Label>
                  <Input
                    id="edit-sortOrder"
                    type="number"
                    min={0}
                    value={editForm.sortOrder}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        sortOrder: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
              </div>

              {/* Featured Switch */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-featured" className="text-sm font-medium">
                    Feature on Homepage
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Current featured total: {actualFeaturedCount} / 6
                  </p>
                </div>
                <Switch
                  id="edit-featured"
                  checked={editForm.featured}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, featured: checked })
                  }
                />
              </div>

              {/* Image URL & Alt Text */}
              <div className="space-y-1.5">
                <Label htmlFor="edit-image-url">Image URL (Optional)</Label>
                <Input
                  id="edit-image-url"
                  placeholder="https://example.com/category-image.jpg"
                  value={editForm.imageUrl}
                  onChange={(e) =>
                    setEditForm({ ...editForm, imageUrl: e.target.value })
                  }
                />
                {editErrors.imageUrl && (
                  <p className="text-xs text-destructive">{editErrors.imageUrl}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-image-alt">Image Alt Text (Optional)</Label>
                <Input
                  id="edit-image-alt"
                  placeholder="Image description for accessibility"
                  value={editForm.imageAlt}
                  onChange={(e) =>
                    setEditForm({ ...editForm, imageAlt: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCategory(null)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- ARCHIVE CONFIRMATION ALERT DIALOG --- */}
      <AlertDialog
        open={!!categoryToArchive}
        onOpenChange={(open) => !open && setCategoryToArchive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Archive Category &ldquo;{categoryToArchive?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm">
              <p>
                This action will mark the category as archived and remove it from the customer-facing
                catalog and store navigation.
              </p>
              <p className="font-semibold text-foreground">
                Important: Categories with active linked products cannot be archived. Products must
                be reassigned or archived first.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveConfirm}
              disabled={archiveMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {archiveMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Archiving...
                </>
              ) : (
                "Archive Category"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
