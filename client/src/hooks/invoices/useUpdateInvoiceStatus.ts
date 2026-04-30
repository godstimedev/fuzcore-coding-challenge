import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Invoice } from "@shared/schema";

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation<Invoice, Error, { id: string; status: "draft" | "sent" | "paid" }>({
    mutationFn: ({ id, status }) =>
      privateApi
        .patch<Invoice>(API_URLS.INVOICES.STATUS(id), { status })
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["invoices", vars.id] });
    },
  });
}
