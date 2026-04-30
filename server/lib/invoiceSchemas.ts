import { z } from "zod";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
  position: z.number().int().min(0).optional(),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().uuid("A valid customer is required"),
  invoiceNumber: z.string().min(1).max(40).optional(),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional().nullable(),
  tax: z.coerce.number().min(0).default(0),
  items: z.array(lineItemSchema).min(1, "At least one line item is required"),
});

export const updateInvoiceSchema = createInvoiceSchema;

export const updateStatusSchema = z.object({
  status: z.enum(["draft", "sent", "paid"]),
});
