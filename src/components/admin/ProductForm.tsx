"use client";

import React, { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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
} from "@/components/ui/alert-dialog";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminProduct, useUpdateProduct, useArchiveProduct } from "@/hooks/useAdminProducts";
import { ProductImageManager } from "@/components/admin/ProductImageManager";
import type {
  CreateProductPayload,
  AdminProductCardDTO,
  ProductVisibility,
} from "@/types/product.types";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Loader2,
  Globe,
  EyeOff,
  Archive,
  AlertCircle,
} from "lucide-react";

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase alphanumeric characters and hyphens"),
  shortDescription: z.string().max(200).optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be non-negative"),
  salePrice: z.number().min(0, "Sale price must be non-negative").optional(),
  isCustomizable: z.boolean().default(false),
  featured: z.boolean().default(false),
  tags: z.string().optional(), // comma-separated → array
  materials: z.string().optional(), // comma-separated → array
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  /** When provided, the form is in edit mode */
  initialData?: AdminProductCardDTO;
  onSubmit: (data: CreateProductPayload) => Promise<void>;
  /** Called after a successful archive so parent can close the dialog */
  onArchived?: () => void;
  isLoading?: boolean;
}

function visibilityBadge(v: ProductVisibility) {
  const map: Record<ProductVisibility, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-secondary text-secondary-foreground" },
    published: { label: "Published", className: "bg-green-100 text-green-800" },
    hidden: { label: "Hidden", className: "border border-orange-200 text-orange-600" },
    archived: { label: "Archived", className: "bg-destructive text-destructive-foreground" },
  };
  const { label, className } = map[v] ?? map.draft;
  return <Badge className={`${className} hover:${className}`}>{label}</Badge>;
}

export function ProductForm({
  initialData,
  onSubmit,
  onArchived,
  isLoading = false,
}: ProductFormProps) {
  const isEdit = !!initialData;
  const { toast } = useToast();

  // Fetch all non-archived categories for the dropdown.
  // No status filter — backend returns all non-archived by default.
  const { data: categories, isLoading: isCategoriesLoading } = useAdminCategories();

  // Fetch full product detail (with all images) when editing
  const {
    data: productDetail,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useAdminProduct(isEdit ? initialData._id : null);

  const updateMutation = useUpdateProduct();
  const archiveMutation = useArchiveProduct();

  const isSlugImmutable = isEdit && initialData.visibility === "published";
  const isArchived = isEdit && initialData.visibility === "archived";
  const currentVisibility: ProductVisibility =
    (productDetail?.visibility ?? initialData?.visibility) || "draft";

  // Track whether the user has manually edited the slug field (create mode only)
  const slugTouchedRef = useRef(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      description: "",
      categoryId: "",
      price: 0,
      salePrice: undefined,
      isCustomizable: false,
      featured: false,
      tags: "",
      materials: "",
    },
  });

  // Auto-generate slug from name in create mode only
  const watchedName = useWatch({ control: form.control, name: "name" });
  useEffect(() => {
    if (isEdit) return; // never auto-generate in edit mode
    if (slugTouchedRef.current) return; // user has manually edited slug
    if (!watchedName) return;
    const generated = watchedName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    form.setValue("slug", generated, { shouldValidate: true, shouldDirty: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedName, isEdit]);

  // Populate form when detail loads or initialData changes
  useEffect(() => {
    if (isEdit && productDetail) {
      form.reset({
        name: productDetail.name,
        slug: productDetail.slug,
        shortDescription: productDetail.shortDescription ?? "",
        description: productDetail.description ?? "",
        categoryId: productDetail.category?._id ?? "",
        price: productDetail.price / 100,
        salePrice: productDetail.salePrice ? productDetail.salePrice / 100 : undefined,
        isCustomizable: productDetail.isCustomizable,
        featured: productDetail.featured,
        tags: productDetail.tags.join(", "),
        materials: productDetail.materials.join(", "),
      });
    } else if (isEdit && initialData) {
      // Fallback to card DTO while detail loads
      form.reset({
        name: initialData.name,
        slug: initialData.slug,
        shortDescription: initialData.shortDescription ?? "",
        description: "",
        categoryId: initialData.category?._id ?? "",
        price: initialData.price / 100,
        salePrice: initialData.salePrice ? initialData.salePrice / 100 : undefined,
        isCustomizable: false,
        featured: initialData.featured,
        tags: "",
        materials: "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productDetail, isEdit]);

  const handleSubmit = async (values: ProductFormValues) => {
    const payload: CreateProductPayload = {
      name: values.name,
      slug: values.slug,
      shortDescription: values.shortDescription || undefined,
      description: values.description || undefined,
      categoryId: values.categoryId,
      price: Math.round(values.price * 100),
      salePrice: values.salePrice ? Math.round(values.salePrice * 100) : undefined,
      isCustomizable: values.isCustomizable,
      featured: values.featured,
    };

    if (values.tags) {
      payload.tags = values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (values.materials) {
      payload.materials = values.materials
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    if (isEdit && initialData) {
      // Edit mode: handle update internally — no need to lift to page
      try {
        await updateMutation.mutateAsync({ id: initialData._id, payload });
        toast({ title: "Product updated", description: `"${payload.name}" updated successfully.` });
        refetchDetail();
      } catch (err: any) {
        if (err?.errors && Array.isArray(err.errors)) {
          err.errors.forEach((e: { field?: string; message: string }) => {
            if (e.field && e.field in form.getValues()) {
              form.setError(e.field as any, { message: e.message });
            }
          });
        }
        toast({
          variant: "destructive",
          title: "Failed to update product",
          description: err instanceof Error ? err.message : "An error occurred.",
        });
      }
    } else {
      // Create mode: delegate to parent
      try {
        await onSubmit(payload);
      } catch (err: any) {
        if (err?.errors && Array.isArray(err.errors)) {
          err.errors.forEach((e: { field?: string; message: string }) => {
            if (e.field && e.field in form.getValues()) {
              form.setError(e.field as any, { message: e.message });
            }
          });
        }
      }
    }
  };

  // ─── Lifecycle helpers ───────────────────────────────────────────────────────

  const hasImages = (productDetail?.images?.length ?? 0) > 0;
  const hasPrimaryImage = (productDetail?.images ?? []).some((img) => img.isPrimary);
  const canPublish = hasImages && hasPrimaryImage && currentVisibility !== "published";
  const canHide = currentVisibility === "published";
  const canRestore = currentVisibility === "hidden";
  const canArchive = currentVisibility !== "archived";

  const isDirty = form.formState.isDirty;

  const handleLifecycle = async (newVisibility: ProductVisibility) => {
    if (!initialData) return;
    try {
      await updateMutation.mutateAsync({
        id: initialData._id,
        payload: { visibility: newVisibility },
      });
      toast({ title: `Product ${newVisibility}`, description: `Visibility changed to ${newVisibility}.` });
      refetchDetail();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to change visibility",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
  };

  const handleArchive = async () => {
    if (!initialData) return;
    try {
      await archiveMutation.mutateAsync(initialData._id);
      toast({ title: "Product archived" });
      onArchived?.();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Archive failed",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
  };

  const lifecycleIsBusy = updateMutation.isPending || archiveMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* ─── Status bar (edit only) ─────────────────────────────────────── */}
        {isEdit && (
          <div className={`p-4 rounded-md border flex flex-col gap-2 ${isArchived ? "bg-destructive/10 border-destructive/20" : "bg-muted/50"}`}>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Current Status:</span>
              {visibilityBadge(currentVisibility)}
            </div>
            {isArchived && (
              <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                <AlertCircle className="h-4 w-4" />
                This product is archived. It cannot be edited or restored from the UI.
              </p>
            )}
          </div>
        )}

        {/* ─── Core Fields ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Winter Wool Scarf" disabled={isArchived} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. winter-wool-scarf"
                    disabled={isSlugImmutable || isArchived}
                    {...field}
                    onChange={(e) => {
                      // Mark slug as manually touched so auto-gen stops
                      if (!isEdit) slugTouchedRef.current = true;
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {isSlugImmutable
                    ? "Slug cannot be changed for published products."
                    : isEdit
                    ? "URL-friendly identifier."
                    : "Auto-filled from name. You can customise it."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={isArchived}
                >
                  <FormControl>
                    <SelectTrigger id="product-category-select">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[100]">
                    {isCategoriesLoading ? (
                      <SelectItem value="__loading" disabled>
                        Loading categories…
                      </SelectItem>
                    ) : (categories ?? []).length === 0 ? (
                      <SelectItem value="__empty" disabled>
                        No categories available
                      </SelectItem>
                    ) : (
                      (categories ?? [])
                        .filter((cat) => !!cat._id && !!cat.name)
                        .map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    disabled={isArchived}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price (₹) — optional</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    disabled={isArchived}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      field.onChange(isNaN(v) ? undefined : v);
                    }}
                  />
                </FormControl>
                <FormDescription>Must be strictly less than price.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder="wool, warm, winter"
                    disabled={isArchived}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>Comma-separated. Max 15. Auto-normalized.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief 1-2 sentence product description"
                  rows={2}
                  disabled={isArchived}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed product description"
                  rows={4}
                  disabled={isArchived}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="materials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Materials</FormLabel>
              <FormControl>
                <Input
                  placeholder="100% Merino Wool, Organic Cotton"
                  disabled={isArchived}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>Comma-separated.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-6">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isArchived}
                    aria-label="Mark as featured"
                  />
                </FormControl>
                <FormLabel className="!mt-0">Featured</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isCustomizable"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isArchived}
                    aria-label="Mark as customizable"
                  />
                </FormControl>
                <FormLabel className="!mt-0">Customizable</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* ─── Submit ───────────────────────────────────────────────────────── */}
        <Button
          type="submit"
          disabled={(isEdit ? updateMutation.isPending : isLoading) || isArchived || (isEdit && !isDirty)}
          className="w-full sm:w-auto"
        >
          {(isEdit ? updateMutation.isPending : isLoading) ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEdit ? (isDirty ? "Save Changes" : "No Changes to Save") : "Create Product"}
        </Button>

        {/* ─── Images (edit only) ───────────────────────────────────────────── */}
        {isEdit && (
          <>
            <Separator />
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Images</h3>
                <p className="text-xs text-muted-foreground">
                  Upload up to 10 images. A published product requires exactly one primary image.
                </p>
              </div>
              {isDetailLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-md border" />
                  ))}
                </div>
              ) : (
                <ProductImageManager
                  productId={initialData._id}
                  images={productDetail?.images ?? []}
                />
              )}
            </div>
          </>
        )}

        {/* ─── Lifecycle (edit only) ─────────────────────────────────────────── */}
        {isEdit && !isArchived && (
          <>
            <Separator />
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Lifecycle Actions</h3>
                <p className="text-xs text-muted-foreground">
                  Change product visibility. Backend enforces all publish requirements.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Publish */}
                {canPublish && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={lifecycleIsBusy || isDirty}
                    onClick={() => handleLifecycle("published")}
                    title={isDirty ? "Save changes first" : undefined}
                  >
                    {lifecycleIsBusy ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="mr-2 h-4 w-4" />
                    )}
                    Publish
                  </Button>
                )}

                {/* Hide (published → hidden) */}
                {canHide && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={lifecycleIsBusy || isDirty}
                    onClick={() => handleLifecycle("hidden")}
                    title={isDirty ? "Save changes first" : undefined}
                  >
                    {lifecycleIsBusy ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <EyeOff className="mr-2 h-4 w-4" />
                    )}
                    Hide
                  </Button>
                )}

                {/* Restore (hidden → published) */}
                {canRestore && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={lifecycleIsBusy || isDirty || !hasPrimaryImage}
                    onClick={() => handleLifecycle("published")}
                    title={isDirty ? "Save changes first" : (!hasPrimaryImage ? "Ensure product has a primary image first" : undefined)}
                  >
                    {lifecycleIsBusy ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Globe className="mr-2 h-4 w-4" />
                    )}
                    Restore to Published
                  </Button>
                )}

                {/* Archive */}
                {canArchive && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={lifecycleIsBusy || isDirty}
                        title={isDirty ? "Save changes first" : undefined}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Product
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive this product?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will hide the product from all public views and set its status to
                          Archived. Products with active pending orders cannot be archived. This
                          action cannot be reversed from the UI.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleArchive}
                        >
                          Archive
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {isDirty && (
                  <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Save your form changes before modifying visibility.
                  </span>
                )}
              </div>

              {/* Hint when publishing is blocked by requirements */}
              {currentVisibility === "draft" && (!hasImages || !hasPrimaryImage) && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-xs text-orange-800 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    Publishing Requirements Missing
                  </p>
                  <p className="text-xs text-orange-700 mt-1 ml-5.5">
                    Upload at least one image and set it as primary before you can publish this product.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </form>
    </Form>
  );
}

