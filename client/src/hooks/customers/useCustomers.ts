import { useQuery } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Customer } from "@shared/schema";

export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => privateApi.get<Customer[]>(API_URLS.CUSTOMERS.BASE).then((r) => r.data),
  });
}
