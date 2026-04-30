import type { Request, Response } from "express";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import { invoices, invoiceItems, customers } from "../../shared/schema";

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["sent"],
  sent: ["paid"],
  paid: [],
};

type LineItemInput = {
  description: string;
  quantity: number;
  unitPrice: number;
  position?: number;
};

type InvoiceBody = {
  customerId: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  notes?: string | null;
  tax: number;
  items: LineItemInput[];
};

async function generateInvoiceNumber(userId: string, trx: any): Promise<string> {
  const [row] = await trx
    .select({ n: sql<string>`count(*)` })
    .from(invoices)
    .where(eq(invoices.userId, userId));
  const nextNum = Number(row?.n ?? 0) + 1;
  return `INV-${String(nextNum).padStart(4, "0")}`;
}

function prepareItems(rawItems: LineItemInput[]) {
  return rawItems.map((item, i) => ({
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
    amount: String((item.quantity * item.unitPrice).toFixed(2)),
    position: item.position ?? i,
  }));
}

function computeTotals(items: Array<{ amount: string }>, taxInput: number) {
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  return {
    subtotal: subtotal.toFixed(2),
    tax: taxInput.toFixed(2),
    total: (subtotal + taxInput).toFixed(2),
  };
}

export async function listInvoices(req: Request, res: Response) {
  const userId = req.session.userId!;
  const { status } = req.query;
  const validStatus = status === "draft" || status === "sent" || status === "paid" ? status : null;

  const list = await db
    .select({
      id: invoices.id,
      userId: invoices.userId,
      customerId: invoices.customerId,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      subtotal: invoices.subtotal,
      tax: invoices.tax,
      total: invoices.total,
      notes: invoices.notes,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
      customerName: customers.name,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(
      validStatus
        ? and(eq(invoices.userId, userId), eq(invoices.status, validStatus))
        : eq(invoices.userId, userId),
    )
    .orderBy(desc(invoices.createdAt));

  return res.json(list);
}

export async function getInvoice(req: Request, res: Response) {
  const userId = req.session.userId!;
  const { id } = req.params;

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

  if (!invoice) return res.status(404).json({ message: "Invoice not found" });

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id))
    .orderBy(asc(invoiceItems.position));

  return res.json({ ...invoice, items });
}

export async function createInvoice(req: Request, res: Response) {
  const userId = req.session.userId!;
  const body = req.body as InvoiceBody;

  const result = await db.transaction(async (trx) => {
    const invoiceNumber = body.invoiceNumber || (await generateInvoiceNumber(userId, trx));
    const preparedItems = prepareItems(body.items);
    const totals = computeTotals(preparedItems, body.tax);

    const [invoice] = await trx
      .insert(invoices)
      .values({
        userId,
        customerId: body.customerId,
        invoiceNumber,
        status: "draft",
        issueDate: body.issueDate,
        dueDate: body.dueDate,
        notes: body.notes ?? null,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
      })
      .returning();

    const insertedItems = await trx
      .insert(invoiceItems)
      .values(preparedItems.map((item) => ({ invoiceId: invoice.id, ...item })))
      .returning();

    return { ...invoice, items: insertedItems };
  });

  return res.status(201).json(result);
}

export async function updateInvoice(req: Request, res: Response) {
  const userId = req.session.userId!;
  const { id } = req.params;

  const [existing] = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

  if (!existing) return res.status(404).json({ message: "Invoice not found" });
  if (existing.status !== "draft") {
    return res.status(422).json({ message: "Only draft invoices can be edited" });
  }

  const body = req.body as InvoiceBody;

  const result = await db.transaction(async (trx) => {
    const preparedItems = prepareItems(body.items);
    const totals = computeTotals(preparedItems, body.tax);

    await trx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));

    const [updated] = await trx
      .update(invoices)
      .set({
        customerId: body.customerId,
        invoiceNumber: body.invoiceNumber,
        issueDate: body.issueDate,
        dueDate: body.dueDate,
        notes: body.notes ?? null,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
        updatedAt: new Date(),
      })
      .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
      .returning();

    const insertedItems = await trx
      .insert(invoiceItems)
      .values(preparedItems.map((item) => ({ invoiceId: id, ...item })))
      .returning();

    return { ...updated, items: insertedItems };
  });

  return res.json(result);
}

export async function updateInvoiceStatus(req: Request, res: Response) {
  const userId = req.session.userId!;
  const { id } = req.params;
  const { status: newStatus } = req.body as { status: "draft" | "sent" | "paid" };

  const [existing] = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

  if (!existing) return res.status(404).json({ message: "Invoice not found" });

  const allowed = VALID_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return res.status(422).json({
      message: `Cannot transition invoice from "${existing.status}" to "${newStatus}"`,
    });
  }

  const [updated] = await db
    .update(invoices)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)))
    .returning();

  return res.json(updated);
}

export async function deleteInvoice(req: Request, res: Response) {
  const userId = req.session.userId!;
  const { id } = req.params;

  const [existing] = await db
    .select({ status: invoices.status })
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.userId, userId)));

  if (!existing) return res.status(404).json({ message: "Invoice not found" });
  if (existing.status !== "draft") {
    return res.status(422).json({ message: "Only draft invoices can be deleted" });
  }

  await db.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.userId, userId)));
  return res.json({ message: "Invoice deleted" });
}
