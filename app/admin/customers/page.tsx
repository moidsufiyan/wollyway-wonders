"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
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
import { Search } from "lucide-react";
import { format } from "date-fns";

export default function AdminCustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState<string>(searchParams.get("status") || "all");

  const [searchInput, setSearchInput] = useState(q);

  // Sync state when URL changes (e.g. back button)
  useEffect(() => {
    setPage(Number(searchParams.get("page")) || 1);
    setQ(searchParams.get("q") || "");
    setStatus(searchParams.get("status") || "all");
    setSearchInput(searchParams.get("q") || "");
  }, [searchParams]);

  const updateUrlParams = (newParams: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchInput, page: 1 });
  };

  const handleStatusChange = (val: string) => {
    updateUrlParams({ status: val, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const queryParams = {
    page: page.toString(),
    limit: "10",
    ...(q && { q }),
    ...(status !== "all" && { status }),
  };

  const { data, isLoading, isError, error } = useAdminCustomers(queryParams);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Manage customer accounts and access.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>Search and filter registered users.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2 max-w-sm">
              <Input
                placeholder="Search by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button type="submit" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[150px] mb-2" /><Skeleton className="h-3 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[80px] rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[20px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-[60px] inline-block" /></TableCell>
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-red-500">
                      Error loading customers: {error instanceof Error ? error.message : "Unknown error"}
                    </TableCell>
                  </TableRow>
                ) : !data || data.customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === "active"
                              ? "default"
                              : customer.status === "suspended"
                              ? "secondary"
                              : "destructive"
                          }
                          className={customer.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.orderCount}</TableCell>
                      <TableCell>{formatMoney(customer.totalSpent)}</TableCell>
                      <TableCell>{format(new Date(customer.createdAt), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/customers/${customer.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing page {data.page} of {data.pages} ({data.total} total)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page === 1}
                  onClick={() => handlePageChange(data.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page === data.pages}
                  onClick={() => handlePageChange(data.page + 1)}
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
