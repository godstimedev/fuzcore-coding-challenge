import { useQuery } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Invoice, InvoiceItem } from "@shared/schema";

export type InvoiceWithItems = Invoice & { items: InvoiceItem[] };

export function useInvoice(id: string | undefined) {
  return useQuery<InvoiceWithItems>({
    queryKey: ["invoices", id],
    queryFn: () =>
      privateApi.get<InvoiceWithItems>(API_URLS.INVOICES.BY_ID(id!)).then((r) => r.data),
    enabled: !!id,
  });
}
