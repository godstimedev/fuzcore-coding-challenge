import type { Request, Response } from 'express';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { customers } from '../../shared/schema';

function normalise(body: Record<string, unknown>) {
	return {
		name: body.name as string,
		email: (body.email as string) || null,
		phone: (body.phone as string) || null,
		address: (body.address as string) || null,
		notes: (body.notes as string) || null,
	};
}

export async function listCustomers(req: Request, res: Response) {
	const userId = req.session.userId!;
	const list = await db
		.select()
		.from(customers)
		.where(eq(customers.userId, userId))
		.orderBy(desc(customers.createdAt));
	return res.json(list);
}

export async function getCustomer(req: Request, res: Response) {
	const userId = req.session.userId!;
	const { id } = req.params;
	const [customer] = await db
		.select()
		.from(customers)
		.where(and(eq(customers.id, id as string), eq(customers.userId, userId)));
	if (!customer) return res.status(404).json({ message: 'Customer not found' });
	return res.json(customer);
}

export async function createCustomer(req: Request, res: Response) {
	const userId = req.session.userId!;
	const [customer] = await db
		.insert(customers)
		.values({ userId, ...normalise(req.body) })
		.returning();
	return res.status(201).json(customer);
}

export async function updateCustomer(req: Request, res: Response) {
	const userId = req.session.userId!;
	const { id } = req.params;
	const [updated] = await db
		.update(customers)
		.set({ ...normalise(req.body), updatedAt: new Date() })
		.where(and(eq(customers.id, id as string), eq(customers.userId, userId)))
		.returning();
	if (!updated) return res.status(404).json({ message: 'Customer not found' });
	return res.json(updated);
}

export async function deleteCustomer(req: Request, res: Response) {
	const userId = req.session.userId!;
	const { id } = req.params;
	const [deleted] = await db
		.delete(customers)
		.where(and(eq(customers.id, id as string), eq(customers.userId, userId)))
		.returning({ id: customers.id });
	if (!deleted) return res.status(404).json({ message: 'Customer not found' });
	return res.json({ message: 'Customer deleted' });
}
