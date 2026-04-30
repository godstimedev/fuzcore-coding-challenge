import { z } from "zod";

export const categorizeSchema = z.object({
  description: z.string().min(1, "Description is required"),
  type: z.enum(["income", "expense"]),
});
