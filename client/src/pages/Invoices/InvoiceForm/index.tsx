import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useInvoice } from "@/hooks/invoices/useInvoice";
import { useCreateInvoice } from "@/hooks/invoices/useCreateInvoice";
import { useUpdateInvoice } from "@/hooks/invoices/useUpdateInvoice";
import { useCustomers } from "@/hooks/customers/useCustomers";
import { APP_ROUTES } from "@/constants/routes";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Must be > 0"),
  unitPrice: z.coerce.number().positive("Must be > 0"),
});

const formSchema = z.object({
  customerId: z.string().uuid("Please select a customer"),
  invoiceNumber: z.string().max(40).optional(),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  tax: z.coerce.number().min(0).default(0),
  items: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  id?: string; // present when editing
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function thirtyDaysLater() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export default function InvoiceFormPage({ id }: Props) {
  const [, navigate] = useLocation();
  const isEditing = !!id;

  const { data: invoice, isLoading: isLoadingInvoice } = useInvoice(id);
  const { data: customers = [] } = useCustomers();
  const { mutate: create, isPending: isCreating } = useCreateInvoice();
  const { mutate: update, isPending: isUpdating } = useUpdateInvoice();
  const isPending = isCreating || isUpdating;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: undefined,
      invoiceNumber: "",
      issueDate: today(),
      dueDate: thirtyDaysLater(),
      notes: "",
      tax: 0,
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (invoice) {
      form.reset({
        customerId: invoice.customerId,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        notes: invoice.notes ?? "",
        tax: parseFloat(invoice.tax),
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
        })),
      });
    }
  }, [invoice]);

  // Live totals
  const watchedItems = form.watch("items");
  const watchedTax = form.watch("tax");
  const subtotal = watchedItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const tax = Number(watchedTax) || 0;
  const total = subtotal + tax;

  function onSubmit(values: FormValues) {
    const payload = {
      customerId: values.customerId,
      invoiceNumber: values.invoiceNumber || undefined,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      notes: values.notes || null,
      tax: values.tax,
      items: values.items,
    };

    if (isEditing) {
      update(
        { id: id!, ...payload },
        {
          onSuccess: (data) => {
            toast.success("Invoice updated");
            navigate(APP_ROUTES.INVOICE_DETAIL(data.id));
          },
          onError: (err: any) =>
            toast.error(err?.response?.data?.message ?? "Failed to update invoice"),
        },
      );
    } else {
      create(payload, {
        onSuccess: (data) => {
          toast.success("Invoice created");
          navigate(APP_ROUTES.INVOICE_DETAIL(data.id));
        },
        onError: (err: any) =>
          toast.error(err?.response?.data?.message ?? "Failed to create invoice"),
      });
    }
  }

  if (isEditing && isLoadingInvoice) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(isEditing ? APP_ROUTES.INVOICE_DETAIL(id!) : APP_ROUTES.INVOICES)}
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            {isEditing ? "Invoice" : "Invoices"}
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">
            {isEditing ? "Edit Invoice" : "New Invoice"}
          </h1>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending} className="mt-8">
          {isPending ? "Saving…" : isEditing ? "Save changes" : "Create invoice"}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Details card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Customer *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice # (auto-generated if blank)</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-0001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div /> {/* spacer */}

                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Payment terms, bank details, etc." rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Line items card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Line Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
              >
                <Plus className="w-3.5 h-3.5" />
                Add row
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_80px_110px_100px_36px] gap-2 text-xs font-medium text-neutral-500 px-1">
                <span>Description</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Unit Price</span>
                <span className="text-right">Amount</span>
                <span />
              </div>

              {fields.map((field, index) => {
                const qty = Number(watchedItems[index]?.quantity) || 0;
                const price = Number(watchedItems[index]?.unitPrice) || 0;
                const lineAmount = qty * price;

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-[1fr_80px_110px_100px_36px] gap-2 items-start"
                  >
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Service or product" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              className="text-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              className="text-right"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-end h-9 px-3 text-sm tabular-nums text-neutral-700">
                      {formatCurrency(lineAmount)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-neutral-400 hover:text-red-500"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-end gap-8 text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="tabular-nums w-28 text-right">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-end gap-4">
                  <span className="text-sm text-neutral-500">Tax</span>
                  <FormField
                    control={form.control}
                    name="tax"
                    render={({ field }) => (
                      <FormItem className="mb-0">
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-28 text-right h-8 text-sm"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-8 font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span className="tabular-nums w-28 text-right">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
