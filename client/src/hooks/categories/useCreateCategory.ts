import { useMutation, useQueryClient } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Category } from "@shared/schema";

interface CategoryBody {
  name: string;
  type: "income" | "expense";
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation<Category, Error, CategoryBody>({
    mutationFn: (body) =>
      privateApi.post<Category>(API_URLS.CATEGORIES.BASE, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
