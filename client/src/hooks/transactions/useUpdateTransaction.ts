import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Transaction } from "@shared/schema";
import type { TransactionBody } from "./useCreateTransaction";

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation<Transaction, Error, TransactionBody & { id: string }>({
    mutationFn: ({ id, ...body }) =>
      privateApi.patch<Transaction>(API_URLS.TRANSACTIONS.BY_ID(id), body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
