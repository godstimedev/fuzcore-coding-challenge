import type { Request, Response } from 'express';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db';
import { transactions } from '../../shared/schema';
import { listTransactionsQuerySchema } from '../lib/transactionSchemas';

type TransactionBody = {
	type: 'income' | 'expense';
	amount: number;
	description?: string | null;
	categoryId?: string | null;
	customerId?: string | null;
	occurredAt?: string | null;
};

function buildConditions(userId: string, query: { type?: string; categoryId?: string }) {
	const conditions = [eq(transactions.userId, userId)];
	if (query.type === 'income' || query.type === 'expense') {
		conditions.push(eq(transactions.type, query.type));
	}
	if (query.categoryId) {
		conditions.push(eq(transactions.categoryId, query.categoryId));
	}
	return and(...conditions);
}

export async function listTransactions(req: Request, res: Response) {
	const userId = req.session.userId!;
	const parsed = listTransactionsQuerySchema.safeParse(req.query);
	const filters = parsed.success ? parsed.data : {};

	const list = await db
		.select()
		.from(transactions)
		.where(buildConditions(userId, filters))
		.orderBy(desc(transactions.occurredAt));

	return res.json(list);
}

export async function getTransaction(req: Request, res: Response) {
	const userId = req.session.userId!;
	const { id } = req.params;
	const [tx] = await db
		.select()
		.from(transactions)
		.where(and(eq(transactions.id, id as string), eq(transactions.userId, userId)));
	if (!tx) return res.status(404).json({ message: 'Transaction not found' });
	return res.json(tx);
}

export async function createTransaction(req: Request, res: Response) {
	const userId = req.session.userId!;
	const body = req.body as TransactionBody;

	const [tx] = await db.transaction(async (trx) => {
		return trx
			.insert(transactions)
			.values({
				userId,
				type: body.type,
				amount: String(body.amount),
				description: body.description ?? null,
				categoryId: body.categoryId ?? null,
				customerId: body.customerId ?? null,
				occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
			})
			.returning();
	});

	return res.status(201).json(tx);
}

export async function updateTransaction(req: Request, res: Response) {
	const userId = req.session.userId!;
	const { id } = req.params;
	const body = req.body as TransactionBody;

	const [tx] = await db.transaction(async (trx) => {
		return trx
			.update(transactions)
			.set({
				type: body.type,
				amount: String(body.amount),
				description: body.description ?? null,
				categoryId: body.categoryId ?? null,
				customerId: body.customerId ?? null,
				occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
			})
			.where(and(eq(transactions.id, id as string), eq(transactions.userId, userId)))
			.returning();
	});

	if (!tx) return res.status(404).json({ message: 'Transaction not found' });
	return res.json(tx);
}

export async function deleteTransaction(req: Request, res: Response) {
	const userId = req.session.userId!;
	const { id } = req.params;
	const [deleted] = await db
		.delete(transactions)
		.where(and(eq(transactions.id, id as string), eq(transactions.userId, userId)))
		.returning({ id: transactions.id });
	if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
	return res.json({ message: 'Transaction deleted' });
}
