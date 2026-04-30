import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id) =>
      privateApi.delete<{ message: string }>(API_URLS.TRANSACTIONS.BY_ID(id)).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
