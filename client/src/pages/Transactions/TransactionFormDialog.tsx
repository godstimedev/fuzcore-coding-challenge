import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateTransaction } from '@/hooks/transactions/useCreateTransaction';
import { useUpdateTransaction } from '@/hooks/transactions/useUpdateTransaction';
import { useCategories } from '@/hooks/categories/useCategories';
import { useCustomers } from '@/hooks/customers/useCustomers';
import { useSuggestCategory } from '@/hooks/transactions/useSuggestCategory';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import type { Transaction } from '@shared/schema';

const NONE = 'none' as const;

const schema = z.object({
	type: z.enum(['income', 'expense']),
	amount: z.coerce.number().positive('Amount must be greater than 0'),
	description: z.string().optional(),
	categoryId: z.string().optional(),
	customerId: z.string().optional(),
	occurredAt: z.string().min(1, 'Date is required'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	transaction?: Transaction;
	onDone: () => void;
}

function toDateInput(ts: Date | string | null | undefined): string {
	if (!ts) return new Date().toISOString().slice(0, 10);
	return new Date(ts).toISOString().slice(0, 10);
}

export function TransactionFormDialog({ open, onOpenChange, transaction, onDone }: Props) {
	const isEditing = !!transaction;
	const { mutate: create, isPending: isCreating } = useCreateTransaction();
	const { mutate: update, isPending: isUpdating } = useUpdateTransaction();
	const { data: categories = [] } = useCategories();
	const { data: customers = [] } = useCustomers();
	const { mutate: suggest, isPending: isSuggesting } = useSuggestCategory();
	const isPending = isCreating || isUpdating;

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			type: 'expense',
			amount: 0,
			description: '',
			occurredAt: new Date().toISOString().slice(0, 10),
			// categoryId and customerId intentionally omitted — undefined shows placeholder
		},
	});

	const selectedType = form.watch('type');
	const currentDescription = form.watch('description');
	const filteredCategories = categories.filter((c) => c.type === selectedType);

	useEffect(() => {
		if (open) {
			form.reset({
				type: transaction?.type ?? 'expense',
				amount: transaction?.amount ? parseFloat(transaction.amount) : 0,
				description: transaction?.description ?? '',
				categoryId: transaction?.categoryId ?? undefined,
				customerId: transaction?.customerId ?? undefined,
				occurredAt: toDateInput(transaction?.occurredAt),
			});
		}
	}, [open, transaction]);

	function handleSuggest() {
		const description = currentDescription?.trim();
		if (!description) {
			toast.error('Enter a description first so the AI has context to work with');
			return;
		}
		suggest(
			{ description, type: selectedType },
			{
				onSuccess: (result) => {
					if (result.categoryId) {
						form.setValue('categoryId', result.categoryId);
						const matched = filteredCategories.find((c) => c.id === result.categoryId);
						toast.success(`Category suggested: ${matched?.name ?? result.categoryId} (${result.confidence} confidence)`);
					} else if (result.suggestedName) {
						toast.info(`No matching category found. Consider creating "${result.suggestedName}".`);
					} else {
						toast.info('No category match found for this description.');
					}
				},
				onError: () => toast.error('AI suggestion failed. Please try again.'),
			},
		);
	}

	function onSubmit(values: FormValues) {
		const payload = {
			type: values.type,
			amount: values.amount,
			description: values.description || null,
			categoryId: values.categoryId || null,
			// "none" sentinel means the user explicitly cleared the customer
			customerId: values.customerId && values.customerId !== NONE ? values.customerId : null,
			occurredAt: values.occurredAt,
		};

		if (isEditing) {
			update(
				{ id: transaction.id, ...payload },
				{
					onSuccess: () => {
						toast.success('Transaction updated');
						onDone();
					},
					onError: () => toast.error('Failed to update transaction'),
				},
			);
		} else {
			create(payload, {
				onSuccess: () => {
					toast.success('Transaction added');
					onDone();
				},
				onError: () => toast.error('Failed to add transaction'),
			});
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isEditing ? 'Edit transaction' : 'Add transaction'}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Type *</FormLabel>
										<Select
											onValueChange={(v) => {
												field.onChange(v);
												// Reset category when type changes — category options differ per type
												form.setValue('categoryId', undefined);
											}}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select type" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="income">Income</SelectItem>
												<SelectItem value="expense">Expense</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Amount *</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" min="0.01" placeholder="0.00" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea placeholder="What is this transaction for?" rows={2} {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="categoryId"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-between">
											<FormLabel>Category</FormLabel>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-6 px-2 text-xs gap-1 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
												onClick={handleSuggest}
												disabled={isSuggesting || !currentDescription?.trim()}
												title="Use AI to suggest a category based on the description"
											>
												<Sparkles className="w-3 h-3" />
												{isSuggesting ? 'Thinking…' : 'Suggest'}
											</Button>
										</div>
										<Select
											onValueChange={field.onChange}
											value={field.value ?? ''}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="None" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{filteredCategories.length === 0 ? (
													<p className="px-2 py-3 text-sm text-muted-foreground text-center">
														No categories for this type
													</p>
												) : (
													filteredCategories.map((cat) => (
														<SelectItem key={cat.id} value={cat.id}>
															{cat.name}
														</SelectItem>
													))
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="customerId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Customer</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value ?? ''}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="None" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={NONE}>None</SelectItem>
												{customers.map((c) => (
													<SelectItem key={c.id} value={c.id}>
														{c.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="occurredAt"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Date *</FormLabel>
									<FormControl>
										<Input type="date" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Add transaction'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
