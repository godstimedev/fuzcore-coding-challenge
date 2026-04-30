import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      privateApi.delete(API_URLS.CATEGORIES.BY_ID(id)).then(() => undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
