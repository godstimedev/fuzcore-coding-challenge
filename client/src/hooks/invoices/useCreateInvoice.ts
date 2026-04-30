import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { InvoiceWithItems } from "./useInvoice";

export interface InvoiceLineItemBody {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceFormBody {
  customerId: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  notes?: string | null;
  tax: number;
  items: InvoiceLineItemBody[];
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation<InvoiceWithItems, Error, InvoiceFormBody>({
    mutationFn: (body) =>
      privateApi.post<InvoiceWithItems>(API_URLS.INVOICES.BASE, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
