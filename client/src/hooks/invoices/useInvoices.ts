import { useQuery } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Invoice } from "@shared/schema";

export type InvoiceListItem = Invoice & { customerName: string | null };

export interface InvoiceListFilters {
  status?: "draft" | "sent" | "paid";
}

export function useInvoices(filters?: InvoiceListFilters) {
  return useQuery<InvoiceListItem[]>({
    queryKey: ["invoices", filters],
    queryFn: () =>
      privateApi
        .get<InvoiceListItem[]>(API_URLS.INVOICES.BASE, { params: filters })
        .then((r) => r.data),
  });
}
