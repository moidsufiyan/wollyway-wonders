"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Upload,
  Trash2,
  Star,
  ChevronUp,
  ChevronDown,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useUploadProductImages,
  useDeleteProductImage,
  useUpdateProduct,
} from "@/hooks/useAdminProducts";
import type { AdminProductDetailImageDTO } from "@/types/product.types";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGES = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ProductImageManagerProps {
  productId: string;
  images: AdminProductDetailImageDTO[];
}

export function ProductImageManager({ productId, images }: ProductImageManagerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deletingPublicId, setDeletingPublicId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingAlt, setEditingAlt] = useState<{ publicId: string; alt: string } | null>(null);

  const uploadMutation = useUploadProductImages();
  const deleteMutation = useDeleteProductImage();
  const updateMutation = useUpdateProduct();

  // Sort images by displayOrder for consistent rendering
  const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  // ─── Upload ─────────────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Client-side validation
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Max file size is 5 MB. ${oversized.map((f) => f.name).join(", ")} exceeded this limit.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const invalidType = files.filter((f) => !ACCEPTED_TYPES.includes(f.type));
    if (invalidType.length > 0) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: `Only JPEG, PNG, WebP, and GIF are allowed.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (images.length + files.length > MAX_IMAGES) {
      toast({
        variant: "destructive",
        title: "Too many images",
        description: `You can have at most ${MAX_IMAGES} images. Currently: ${images.length}, trying to add: ${files.length}.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));

    try {
      await uploadMutation.mutateAsync({ id: productId, formData });
      toast({ title: "Images uploaded", description: `${files.length} image(s) uploaded.` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Delete ──────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeletingPublicId(confirmDeleteId);
    setConfirmDeleteId(null);
    try {
      await deleteMutation.mutateAsync({ id: productId, publicId: confirmDeleteId });
      toast({ title: "Image deleted" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
    setDeletingPublicId(null);
  };

  // ─── Reorder & Primary — uses PATCH /admin/products/:id with images array ──

  const patchImages = async (updatedImages: AdminProductDetailImageDTO[]) => {
    try {
      await updateMutation.mutateAsync({ id: productId, payload: { images: updatedImages } });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to update image metadata",
        description: err instanceof Error ? err.message : "An error occurred.",
      });
    }
  };

  const handleSaveAlt = () => {
    if (!editingAlt) return;
    const updated = sortedImages.map((img) =>
      img.publicId === editingAlt.publicId ? { ...img, alt: editingAlt.alt } : img
    );
    patchImages(updated);
    setEditingAlt(null);
  };

  const handleSetPrimary = (publicId: string) => {
    const updated = sortedImages.map((img) => ({ ...img, isPrimary: img.publicId === publicId }));
    patchImages(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sortedImages];
    const prev = updated[index - 1];
    const curr = updated[index];
    // Swap displayOrder values
    const tempOrder = prev.displayOrder;
    updated[index - 1] = { ...curr, displayOrder: tempOrder };
    updated[index] = { ...prev, displayOrder: curr.displayOrder };
    patchImages(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === sortedImages.length - 1) return;
    const updated = [...sortedImages];
    const next = updated[index + 1];
    const curr = updated[index];
    const tempOrder = next.displayOrder;
    updated[index + 1] = { ...curr, displayOrder: tempOrder };
    updated[index] = { ...next, displayOrder: curr.displayOrder };
    patchImages(updated);
  };

  const isUpdating = updateMutation.isPending;
  const isUploading = uploadMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading || images.length >= MAX_IMAGES}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isUploading ? "Uploading..." : "Upload Images"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {images.length}/{MAX_IMAGES} · Max 5 MB per file · JPEG, PNG, WebP, GIF
        </span>
        <Input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload product images"
        />
      </div>

      {/* Image grid */}
      {sortedImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-muted-foreground gap-2">
          <ImageIcon className="h-10 w-10 opacity-30" />
          <p className="text-sm">No images yet. Upload at least one image to publish.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {sortedImages.map((img, index) => {
            const isDeleting = deletingPublicId === img.publicId;
            const isCurrentUpdating = isUpdating;

            return (
              <div
                key={img.publicId}
                className="group relative rounded-md overflow-hidden border bg-muted"
              >
                {/* Image */}
                <div className="aspect-square relative">
                  <Image
                    src={img.url}
                    alt={img.alt || "Product image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  {isDeleting && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Primary badge */}
                {img.isPrimary && (
                  <div className="absolute top-1 left-1">
                    <Badge className="text-[10px] px-1 py-0 bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
                      Primary
                    </Badge>
                  </div>
                )}

                {/* Controls overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 flex items-center justify-between gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Reorder */}
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      aria-label="Move image up"
                      disabled={index === 0 || isCurrentUpdating || isDeleting}
                      onClick={() => handleMoveUp(index)}
                      className="rounded p-0.5 text-white hover:bg-white/20 disabled:opacity-40"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move image down"
                      disabled={index === sortedImages.length - 1 || isCurrentUpdating || isDeleting}
                      onClick={() => handleMoveDown(index)}
                      className="rounded p-0.5 text-white hover:bg-white/20 disabled:opacity-40"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Set Primary */}
                  <button
                    type="button"
                    aria-label="Set as primary image"
                    disabled={img.isPrimary || isCurrentUpdating || isDeleting}
                    onClick={() => handleSetPrimary(img.publicId)}
                    className="rounded p-0.5 text-white hover:bg-white/20 disabled:opacity-40"
                  >
                    <Star className={`h-3.5 w-3.5 ${img.isPrimary ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </button>

                  {/* Edit Alt */}
                  <button
                    type="button"
                    aria-label="Edit image alt text"
                    disabled={isCurrentUpdating || isDeleting}
                    onClick={() => setEditingAlt({ publicId: img.publicId, alt: img.alt || "" })}
                    className="rounded p-0.5 text-blue-300 hover:bg-white/20 disabled:opacity-40"
                  >
                    <span className="text-[10px] font-bold px-0.5">ALT</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    aria-label="Delete image"
                    disabled={isDeleting || isCurrentUpdating}
                    onClick={() => setConfirmDeleteId(img.publicId)}
                    className="rounded p-0.5 text-red-300 hover:bg-white/20 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the image from Cloudinary. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Alt Text Dialog */}
      <AlertDialog open={!!editingAlt} onOpenChange={(open) => !open && setEditingAlt(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Image Alt Text</AlertDialogTitle>
            <AlertDialogDescription>
              Provide descriptive text for screen readers and SEO.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={editingAlt?.alt || ""}
              onChange={(e) => setEditingAlt(prev => prev ? { ...prev, alt: e.target.value } : null)}
              placeholder="e.g. Red Winter Wool Scarf folded on a table"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveAlt();
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAlt}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
