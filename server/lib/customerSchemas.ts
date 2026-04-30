import { z } from "zod";

const optionalEmail = z
  .string()
  .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Invalid email address")
  .optional()
  .nullable();

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: optionalEmail,
  phone: z.string().max(40).optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema;
