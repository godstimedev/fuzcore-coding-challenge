import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { categories } from "../../shared/schema";
import { categorizeTransaction } from "../lib/ai/categorize";

export async function suggestCategory(req: Request, res: Response) {
  const userId = req.session.userId!;
  const { description, type } = req.body as { description: string; type: "income" | "expense" };

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ message: "AI categorization is not configured" });
  }

  const userCategories = await db
    .select({ id: categories.id, name: categories.name, type: categories.type })
    .from(categories)
    .where(eq(categories.userId, userId));

  try {
    const result = await categorizeTransaction(description, type, userCategories);
    return res.json(result);
  } catch (err) {
    console.error("AI categorization failed:", err);
    return res.status(502).json({ message: "AI categorization failed. Please try again." });
  }
}
