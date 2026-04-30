import { useQuery } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Transaction } from "@shared/schema";

export interface TransactionFilters {
  type?: "income" | "expense";
  categoryId?: string;
}

export function useTransactions(filters?: TransactionFilters) {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", filters],
    queryFn: () =>
      privateApi
        .get<Transaction[]>(API_URLS.TRANSACTIONS.BASE, { params: filters })
        .then((r) => r.data),
  });
}
