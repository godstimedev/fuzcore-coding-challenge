import type { Request, Response } from "express";
import { and, asc, eq, gte, sql } from "drizzle-orm";
import { db } from "../db";
import { invoices, transactions } from "../../shared/schema";

function getLast6MonthKeys(): { key: string; label: string }[] {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString("en-US", { month: "short", year: "numeric" }),
    });
  }
  return months;
}

export async function getDashboardSummary(req: Request, res: Response) {
  const userId = req.session.userId!;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [revenueRow, outstandingRow, expensesRow, incomeRow] = await Promise.all([
    db
      .select({ total: sql<string>`coalesce(sum(${invoices.total}), 0)` })
      .from(invoices)
      .where(and(eq(invoices.userId, userId), eq(invoices.status, "paid")))
      .then((r) => r[0]),

    db
      .select({ total: sql<string>`coalesce(sum(${invoices.total}), 0)` })
      .from(invoices)
      .where(and(eq(invoices.userId, userId), eq(invoices.status, "sent")))
      .then((r) => r[0]),

    db
      .select({ total: sql<string>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "expense")))
      .then((r) => r[0]),

    db
      .select({ total: sql<string>`coalesce(sum(${transactions.amount}), 0)` })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), eq(transactions.type, "income")))
      .then((r) => r[0]),
  ]);

  const [monthlyRevRows, monthlyExpRows, monthlyIncRows] = await Promise.all([
    db
      .select({
        key: sql<string>`to_char(date_trunc('month', ${invoices.createdAt}), 'YYYY-MM')`,
        value: sql<string>`coalesce(sum(${invoices.total}), 0)`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.status, "paid"),
          gte(invoices.createdAt, sixMonthsAgo),
        ),
      )
      .groupBy(sql`date_trunc('month', ${invoices.createdAt})`)
      .orderBy(asc(sql`date_trunc('month', ${invoices.createdAt})`)),

    db
      .select({
        key: sql<string>`to_char(date_trunc('month', ${transactions.occurredAt}), 'YYYY-MM')`,
        value: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "expense"),
          gte(transactions.occurredAt, sixMonthsAgo),
        ),
      )
      .groupBy(sql`date_trunc('month', ${transactions.occurredAt})`)
      .orderBy(asc(sql`date_trunc('month', ${transactions.occurredAt})`)),

    db
      .select({
        key: sql<string>`to_char(date_trunc('month', ${transactions.occurredAt}), 'YYYY-MM')`,
        value: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "income"),
          gte(transactions.occurredAt, sixMonthsAgo),
        ),
      )
      .groupBy(sql`date_trunc('month', ${transactions.occurredAt})`)
      .orderBy(asc(sql`date_trunc('month', ${transactions.occurredAt})`)),
  ]);

  const revMap = Object.fromEntries(monthlyRevRows.map((r) => [r.key, parseFloat(r.value)]));
  const expMap = Object.fromEntries(monthlyExpRows.map((r) => [r.key, parseFloat(r.value)]));
  const incMap = Object.fromEntries(monthlyIncRows.map((r) => [r.key, parseFloat(r.value)]));

  const monthly = getLast6MonthKeys().map(({ key, label }) => ({
    month: label,
    revenue: revMap[key] ?? 0,
    expenses: expMap[key] ?? 0,
    income: incMap[key] ?? 0,
  }));

  return res.json({
    revenue: parseFloat(revenueRow?.total ?? "0"),
    expenses: parseFloat(expensesRow?.total ?? "0"),
    outstanding: parseFloat(outstandingRow?.total ?? "0"),
    income: parseFloat(incomeRow?.total ?? "0"),
    monthly,
  });
}
