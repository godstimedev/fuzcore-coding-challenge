import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useInvoices, type InvoiceListFilters } from "@/hooks/invoices/useInvoices";
import { useDeleteInvoice } from "@/hooks/invoices/useDeleteInvoice";
import { APP_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Plus, FileText } from "lucide-react";
import type { InvoiceListItem } from "@/hooks/invoices/useInvoices";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-neutral-100 text-neutral-600 hover:bg-neutral-100" },
  sent: { label: "Sent", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  paid: { label: "Paid", className: "bg-green-100 text-green-700 hover:bg-green-100" },
};

function formatCurrency(amount: string | number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    typeof amount === "string" ? parseFloat(amount) : amount,
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function InvoicesPage() {
  const [, navigate] = useLocation();
  const [filters, setFilters] = useState<InvoiceListFilters>({});
  const { data: invoices = [], isLoading } = useInvoices(filters);
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
  const [deletingInvoice, setDeletingInvoice] = useState<InvoiceListItem | undefined>(undefined);

  function confirmDelete() {
    if (!deletingInvoice) return;
    deleteInvoice(deletingInvoice.id, {
      onSuccess: () => {
        toast.success("Invoice deleted");
        setDeletingInvoice(undefined);
      },
      onError: () => toast.error("Failed to delete invoice"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Invoices</h1>
          <p className="text-neutral-500 mt-1">{invoices.length} total</p>
        </div>
        <Button onClick={() => navigate(APP_ROUTES.INVOICES_NEW)} className="gap-2">
          <Plus className="w-4 h-4" />
          New invoice
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-3">
        <Select
          value={filters.status ?? "all"}
          onValueChange={(v) =>
            setFilters((f) => ({
              ...f,
              status: v === "all" ? undefined : (v as "draft" | "sent" | "paid"),
            }))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <FileText className="w-10 h-10 text-neutral-300" />
            <div>
              <p className="font-medium text-neutral-700">No invoices yet</p>
              <p className="text-sm text-neutral-500 mt-1">Create your first invoice to get started</p>
            </div>
            <Button
              onClick={() => navigate(APP_ROUTES.INVOICES_NEW)}
              variant="outline"
              size="sm"
              className="mt-2 gap-2"
            >
              <Plus className="w-4 h-4" />
              New invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const badge = STATUS_BADGE[inv.status] ?? STATUS_BADGE.draft;
                return (
                  <TableRow
                    key={inv.id}
                    className="cursor-pointer"
                    onClick={() => navigate(APP_ROUTES.INVOICE_DETAIL(inv.id))}
                  >
                    <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell className="text-neutral-500">
                      {inv.customerName ?? <span className="text-neutral-300">—</span>}
                    </TableCell>
                    <TableCell className="text-neutral-500 whitespace-nowrap">
                      {formatDate(inv.issueDate)}
                    </TableCell>
                    <TableCell className="text-neutral-500 whitespace-nowrap">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={badge.className}>
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(inv.total)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(APP_ROUTES.INVOICE_DETAIL(inv.id))}
                          >
                            View
                          </DropdownMenuItem>
                          {inv.status === "draft" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => navigate(APP_ROUTES.INVOICE_EDIT(inv.id))}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setDeletingInvoice(inv)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
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

      <AlertDialog
        open={!!deletingInvoice}
        onOpenChange={(open) => !open && setDeletingInvoice(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingInvoice?.invoiceNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this draft invoice and all its line items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
