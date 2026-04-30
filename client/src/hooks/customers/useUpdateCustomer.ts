import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Customer } from "@shared/schema";
import type { CustomerBody } from "./useCreateCustomer";

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation<Customer, Error, CustomerBody & { id: string }>({
    mutationFn: ({ id, ...body }) =>
      privateApi.patch<Customer>(API_URLS.CUSTOMERS.BY_ID(id), body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
