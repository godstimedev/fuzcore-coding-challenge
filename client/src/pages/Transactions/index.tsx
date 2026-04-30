import { useState } from 'react';
import { toast } from 'sonner';
import { useTransactions, type TransactionFilters } from '@/hooks/transactions/useTransactions';
import { useDeleteTransaction } from '@/hooks/transactions/useDeleteTransaction';
import { useCategories } from '@/hooks/categories/useCategories';
import { TransactionFormDialog } from './TransactionFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Plus, ArrowLeftRight } from 'lucide-react';
import type { Transaction } from '@shared/schema';

function formatCurrency(amount: string | number) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
		typeof amount === 'string' ? parseFloat(amount) : amount,
	);
}

function formatDate(ts: Date | string) {
	return new Date(ts).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

export default function TransactionsPage() {
	const [filters, setFilters] = useState<TransactionFilters>({});
	const { data: transactions = [], isLoading } = useTransactions(filters);
	const { data: categories = [] } = useCategories();
	const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

	const [formOpen, setFormOpen] = useState(false);
	const [editingTx, setEditingTx] = useState<Transaction | undefined>(undefined);
	const [deletingTx, setDeletingTx] = useState<Transaction | undefined>(undefined);

	function openAdd() {
		setEditingTx(undefined);
		setFormOpen(true);
	}

	function openEdit(tx: Transaction) {
		setEditingTx(tx);
		setFormOpen(true);
	}

	function handleFormDone() {
		setFormOpen(false);
		setEditingTx(undefined);
	}

	function confirmDelete() {
		if (!deletingTx) return;
		deleteTransaction(deletingTx.id, {
			onSuccess: () => {
				toast.success('Transaction deleted');
				setDeletingTx(undefined);
			},
			onError: () => toast.error('Failed to delete transaction'),
		});
	}

	const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

	const income = transactions
		.filter((t) => t.type === 'income')
		.reduce((sum, t) => sum + parseFloat(t.amount), 0);
	const expenses = transactions
		.filter((t) => t.type === 'expense')
		.reduce((sum, t) => sum + parseFloat(t.amount), 0);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-900">Transactions</h1>
					<p className="text-neutral-500 mt-1">{transactions.length} total</p>
				</div>
				<Button onClick={openAdd} className="gap-2">
					<Plus className="w-4 h-4" />
					Add transaction
				</Button>
			</div>

			{/* Summary cards */}
			<div className="grid grid-cols-3 gap-4">
				<Card>
					<CardContent className="pt-4">
						<p className="text-sm text-neutral-500">Income</p>
						<p className="text-xl font-semibold text-green-600 mt-1">{formatCurrency(income)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-4">
						<p className="text-sm text-neutral-500">Expenses</p>
						<p className="text-xl font-semibold text-red-600 mt-1">{formatCurrency(expenses)}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="pt-4">
						<p className="text-sm text-neutral-500">Net</p>
						<p
							className={`text-xl font-semibold mt-1 ${income - expenses >= 0 ? 'text-green-600' : 'text-red-600'}`}
						>
							{formatCurrency(income - expenses)}
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<div className="flex gap-3">
				<Select
					value={filters.type ?? 'all'}
					onValueChange={(v) =>
						setFilters((f) => ({ ...f, type: v === 'all' ? undefined : (v as 'income' | 'expense') }))
					}
				>
					<SelectTrigger className="w-40">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All types</SelectItem>
						<SelectItem value="income">Income</SelectItem>
						<SelectItem value="expense">Expense</SelectItem>
					</SelectContent>
				</Select>

				<Select
					value={filters.categoryId ?? 'all'}
					onValueChange={(v) => setFilters((f) => ({ ...f, categoryId: v === 'all' ? undefined : v }))}
				>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="All categories" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All categories</SelectItem>
						{categories
							.filter((c) => !filters.type || c.type === filters.type)
							.map((cat) => (
								<SelectItem key={cat.id} value={cat.id}>
									{cat.name}
								</SelectItem>
							))}
					</SelectContent>
				</Select>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center py-20">
					<div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
				</div>
			) : transactions.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-20 gap-3 text-center">
						<ArrowLeftRight className="w-10 h-10 text-neutral-300" />
						<div>
							<p className="font-medium text-neutral-700">No transactions yet</p>
							<p className="text-sm text-neutral-500 mt-1">Add your first transaction to get started</p>
						</div>
						<Button onClick={openAdd} variant="outline" size="sm" className="mt-2 gap-2">
							<Plus className="w-4 h-4" />
							Add transaction
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="rounded-md border bg-white">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Type</TableHead>
								<TableHead className="text-right">Amount</TableHead>
								<TableHead className="w-12" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{transactions.map((tx) => (
								<TableRow key={tx.id}>
									<TableCell className="text-neutral-500 whitespace-nowrap">
										{formatDate(tx.occurredAt)}
									</TableCell>
									<TableCell className="font-medium">
										{tx.description ?? <span className="text-neutral-300">—</span>}
									</TableCell>
									<TableCell className="text-neutral-500">
										{tx.categoryId ? (
											(categoryMap.get(tx.categoryId) ?? '—')
										) : (
											<span className="text-neutral-300">—</span>
										)}
									</TableCell>
									<TableCell>
										<Badge
											variant={tx.type === 'income' ? 'default' : 'destructive'}
											className={
												tx.type === 'income'
													? 'bg-green-100 text-green-700 hover:bg-green-100'
													: 'bg-red-100 text-red-700 hover:bg-red-100'
											}
										>
											{tx.type === 'income' ? 'Income' : 'Expense'}
										</Badge>
									</TableCell>
									<TableCell className="text-right font-medium tabular-nums">
										<span className={tx.type === 'income' ? 'text-green-600' : 'text-red-600'}>
											{tx.type === 'income' ? '+' : '−'}
											{formatCurrency(tx.amount)}
										</span>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon" className="h-8 w-8">
													<MoreHorizontal className="w-4 h-4" />
													<span className="sr-only">Actions</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => openEdit(tx)}>Edit</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-red-600 focus:text-red-600"
													onClick={() => setDeletingTx(tx)}
												>
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<TransactionFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				transaction={editingTx}
				onDone={handleFormDone}
			/>

			<AlertDialog open={!!deletingTx} onOpenChange={(open) => !open && setDeletingTx(undefined)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete transaction?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this transaction and cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							disabled={isDeleting}
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
						>
							{isDeleting ? 'Deleting…' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
