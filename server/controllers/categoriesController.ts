import type { Request, Response } from "express";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../db";
import { categories } from "../../shared/schema";

export async function listCategories(req: Request, res: Response) {
  const userId = req.session.userId!;
  const list = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.type), asc(categories.name));
  return res.json(list);
}

export async function createCategory(req: Request, res: Response) {
  const userId = req.session.userId!;
  const { name, type } = req.body as { name: string; type: "income" | "expense" };
  try {
    const [category] = await db
      .insert(categories)
      .values({ userId, name, type })
      .returning();
    return res.status(201).json(category);
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ message: "A category with this name and type already exists" });
    }
    throw err;
  }
}

export async function updateCategory(req: Request, res: Response) {
  const userId = req.session.userId!;
  const { id } = req.params;
  const { name, type } = req.body as { name: string; type: "income" | "expense" };
  try {
    const [updated] = await db
      .update(categories)
      .set({ name, type })
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    if (!updated) return res.status(404).json({ message: "Category not found" });
    return res.json(updated);
  } catch (err: any) {
    if (err?.code === "23505") {
      return res.status(409).json({ message: "A category with this name and type already exists" });
    }
    throw err;
  }
}

export async function deleteCategory(req: Request, res: Response) {
  const userId = req.session.userId!;
  const { id } = req.params;
  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning({ id: categories.id });
  if (!deleted) return res.status(404).json({ message: "Category not found" });
  return res.json({ message: "Category deleted" });
}
