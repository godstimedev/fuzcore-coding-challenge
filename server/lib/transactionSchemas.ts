import { z } from "zod";

export const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  occurredAt: z.string().optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema;

export const listTransactionsQuerySchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  categoryId: z.string().uuid().optional(),
});
