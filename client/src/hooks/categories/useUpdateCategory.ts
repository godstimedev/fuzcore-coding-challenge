import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Category } from "@shared/schema";

interface UpdateCategoryBody {
  id: string;
  name: string;
  type: "income" | "expense";
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation<Category, Error, UpdateCategoryBody>({
    mutationFn: ({ id, ...body }) =>
      privateApi.patch<Category>(API_URLS.CATEGORIES.BY_ID(id), body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
