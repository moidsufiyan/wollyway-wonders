"use client";

import React, { useState } from "react";
import { useAdminInventoryHistory } from "@/hooks/useAdminInventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Props {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryHistoryDialog({ productId, open, onOpenChange }: Props) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, isFetching } = useAdminInventoryHistory(
    productId || "",
    page,
    limit
  );

  const totalPages = data?.pagination?.totalPages ?? 1;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPage(1); // Reset page on close
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Inventory History</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 py-2">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center text-destructive py-6">
            Failed to load history.
          </div>
        ) : !data?.history?.length ? (
          <div className="text-center py-6 text-muted-foreground">
            No history found for this product.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Before</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">After</TableHead>
                    <TableHead>User / Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.history.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(record.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {record.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {record.before}
                      </TableCell>
                      <TableCell className={`text-right font-medium tabular-nums ${record.quantity > 0 ? "text-emerald-600" : record.quantity < 0 ? "text-red-600" : ""}`}>
                        {record.quantity > 0 ? "+" : ""}
                        {record.quantity}
                      </TableCell>
                      <TableCell className="text-right font-bold tabular-nums">
                        {record.after}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="text-xs">
                          {record.createdBy ? (
                            <span className="font-medium">{record.createdBy.name}</span>
                          ) : (
                            <span className="text-muted-foreground italic">System</span>
                          )}
                          {record.notes && (
                            <p className="text-muted-foreground truncate" title={record.notes}>
                              {record.notes}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
