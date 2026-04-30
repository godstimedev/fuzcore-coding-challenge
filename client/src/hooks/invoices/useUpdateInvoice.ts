import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { InvoiceWithItems } from "./useInvoice";
import type { InvoiceFormBody } from "./useCreateInvoice";

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation<InvoiceWithItems, Error, InvoiceFormBody & { id: string }>({
    mutationFn: ({ id, ...body }) =>
      privateApi.patch<InvoiceWithItems>(API_URLS.INVOICES.BY_ID(id), body).then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoices", vars.id] });
    },
  });
}
