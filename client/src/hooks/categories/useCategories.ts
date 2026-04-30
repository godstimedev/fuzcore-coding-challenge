import { useQuery } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { Category } from "@shared/schema";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => privateApi.get<Category[]>(API_URLS.CATEGORIES.BASE).then((r) => r.data),
  });
}
