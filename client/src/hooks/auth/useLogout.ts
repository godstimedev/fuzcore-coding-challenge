import { useMutation } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";

export function useLogout() {
  return useMutation<{ message: string }, Error, void>({
    mutationFn: () =>
      privateApi.post<{ message: string }>(API_URLS.AUTH.LOGOUT).then((r) => r.data),
  });
}
