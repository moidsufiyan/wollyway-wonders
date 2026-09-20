"use client";

import React, { useState, useEffect } from "react";
import { useAdjustInventory } from "@/hooks/useAdminInventory";
import { AdminInventoryItemDTO, InventoryTransactionReason } from "@/types/inventory.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  item: AdminInventoryItemDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REASONS: { label: string; value: InventoryTransactionReason }[] = [
  { label: "Manual Adjustment", value: "manual" },
  { label: "Damaged Goods", value: "damage" },
  { label: "Audit / Stocktake", value: "audit" },
  { label: "Correction", value: "correction" },
  { label: "Shrinkage", value: "shrinkage" },
];

export function InventoryAdjustmentDialog({ item, open, onOpenChange }: Props) {
  const { mutateAsync: adjustInventory, isPending } = useAdjustInventory();
  const [changeStr, setChangeStr] = useState("");
  const [reason, setReason] = useState<InventoryTransactionReason>("manual");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setChangeStr("");
      setReason("manual");
      setNotes("");
      setError(null);
    }
  }, [open]);

  const change = parseInt(changeStr, 10);
  const isValidChange = !isNaN(change) && change !== 0;

  const currentAvailable = item?.available || 0;
  const currentReserved = item?.reserved || 0;
  const newAvailable = currentAvailable + (isNaN(change) ? 0 : change);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !isValidChange) return;

    setError(null);
    try {
      await adjustInventory({
        productId: item.productId,
        data: {
          change,
          reason,
          notes: notes.trim() || undefined,
        },
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to adjust inventory");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Inventory</DialogTitle>
        </DialogHeader>
        {item && (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium mb-1">Product</p>
              <p className="text-sm text-muted-foreground">{item.product?.name || item.productId}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Current Available</p>
                <p className="text-lg tabular-nums">{currentAvailable}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Active Reserved</p>
                <p className="text-lg tabular-nums text-muted-foreground">{currentReserved}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment-change">Adjustment Amount</Label>
              <Input
                id="adjustment-change"
                type="number"
                value={changeStr}
                onChange={(e) => setChangeStr(e.target.value)}
                placeholder="e.g. 5 or -2"
              />
              <p className="text-xs text-muted-foreground">
                Use positive numbers to add stock, negative to remove.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment-reason">Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as InventoryTransactionReason)}>
                <SelectTrigger id="adjustment-reason">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustment-notes">Notes (Optional)</Label>
              <Textarea
                id="adjustment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
                maxLength={500}
              />
            </div>

            <div className="bg-muted p-3 rounded-md flex items-center justify-between">
              <span className="text-sm font-medium">Resulting Available:</span>
              <span className={`text-lg font-bold tabular-nums ${newAvailable < 0 || newAvailable < currentReserved ? 'text-destructive' : ''}`}>
                {newAvailable}
              </span>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isValidChange || isPending || newAvailable < 0 || newAvailable < currentReserved}>
                {isPending ? "Saving..." : "Confirm Adjustment"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
