import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Customer } from "@shared/schema";

export interface CustomerBody {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation<Customer, Error, CustomerBody>({
    mutationFn: (body) =>
      privateApi.post<Customer>(API_URLS.CUSTOMERS.BASE, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
