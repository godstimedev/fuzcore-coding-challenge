import { useLocation } from "wouter";
import { toast } from "sonner";
import { useInvoice } from "@/hooks/invoices/useInvoice";
import { useUpdateInvoiceStatus } from "@/hooks/invoices/useUpdateInvoiceStatus";
import { useDeleteInvoice } from "@/hooks/invoices/useDeleteInvoice";
import { APP_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  id: string;
}

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
    month: "long",
    day: "numeric",
  });
}

export default function InvoiceDetailPage({ id }: Props) {
  const [, navigate] = useLocation();
  const { data: invoice, isLoading } = useInvoice(id);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateInvoiceStatus();
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20 text-neutral-500">
        Invoice not found.{" "}
        <button onClick={() => navigate(APP_ROUTES.INVOICES)} className="underline">
          Go back
        </button>
      </div>
    );
  }

  const badge = STATUS_BADGE[invoice.status] ?? STATUS_BADGE.draft;

  function handleStatusTransition(newStatus: "sent" | "paid") {
    updateStatus(
      { id, status: newStatus },
      {
        onSuccess: () => toast.success(`Invoice marked as ${newStatus}`),
        onError: (err: any) =>
          toast.error(err?.response?.data?.message ?? "Failed to update status"),
      },
    );
  }

  function confirmDelete() {
    deleteInvoice(id, {
      onSuccess: () => {
        toast.success("Invoice deleted");
        navigate(APP_ROUTES.INVOICES);
      },
      onError: () => toast.error("Failed to delete invoice"),
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(APP_ROUTES.INVOICES)}
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Invoices
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">{invoice.invoiceNumber}</h1>
            <Badge variant="outline" className={badge.className}>
              {badge.label}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 mt-8">
          {invoice.status === "draft" && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => navigate(APP_ROUTES.INVOICE_EDIT(id))}
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-red-600 hover:text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </Button>
            </>
          )}
          {invoice.status === "draft" && (
            <Button
              size="sm"
              onClick={() => handleStatusTransition("sent")}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? "Updating…" : "Mark as Sent"}
            </Button>
          )}
          {invoice.status === "sent" && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleStatusTransition("paid")}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? "Updating…" : "Mark as Paid"}
            </Button>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{invoice.customerId}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Issued</span>
              <span>{formatDate(invoice.issueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Due</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-24">Qty</TableHead>
                <TableHead className="text-right w-32">Unit Price</TableHead>
                <TableHead className="text-right w-32">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatCurrency(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="border-t px-6 py-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="tabular-nums">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Tax</span>
              <span className="tabular-nums">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {invoice.invoiceNumber}?</AlertDialogTitle>
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
