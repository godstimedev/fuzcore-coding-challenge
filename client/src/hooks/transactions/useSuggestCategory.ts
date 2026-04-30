import { useMutation } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";

interface SuggestPayload {
  description: string;
  type: "income" | "expense";
}

export interface SuggestResult {
  categoryId: string | null;
  confidence: "high" | "medium" | "low";
  suggestedName?: string;
}

export function useSuggestCategory() {
  return useMutation<SuggestResult, Error, SuggestPayload>({
    mutationFn: (payload) =>
      privateApi.post<SuggestResult>(API_URLS.AI.CATEGORIZE, payload).then((r) => r.data),
  });
}
