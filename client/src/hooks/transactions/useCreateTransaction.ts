import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Transaction } from "@shared/schema";

export interface TransactionBody {
  type: "income" | "expense";
  amount: number;
  description?: string | null;
  categoryId?: string | null;
  customerId?: string | null;
  occurredAt?: string | null;
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation<Transaction, Error, TransactionBody>({
    mutationFn: (body) =>
      privateApi.post<Transaction>(API_URLS.TRANSACTIONS.BASE, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
