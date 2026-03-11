import type { Express } from "express";
import type { Server } from "http";
import { db } from "./db";
import { counter } from "../shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(httpServer: Server, app: Express) {
  app.get("/api/counter", async (_req, res) => {
    const rows = await db.select().from(counter).where(eq(counter.id, 1));
    if (rows.length === 0) {
      const inserted = await db
        .insert(counter)
        .values({ id: 1, count: 0 })
        .returning();
      return res.json({ count: inserted[0].count });
    }
    return res.json({ count: rows[0].count });
  });

  app.post("/api/counter/increment", async (_req, res) => {
    const rows = await db.select().from(counter).where(eq(counter.id, 1));
    if (rows.length === 0) {
      const inserted = await db
        .insert(counter)
        .values({ id: 1, count: 1 })
        .returning();
      return res.json({ count: inserted[0].count });
    }
    const updated = await db
      .update(counter)
      .set({ count: rows[0].count + 1 })
      .where(eq(counter.id, 1))
      .returning();
    return res.json({ count: updated[0].count });
  });
}
