import { useQuery } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { AuthUser } from "@/context/AuthContext";

export function useMe() {
  return useQuery<AuthUser>({
    queryKey: ["me"],
    queryFn: () => privateApi.get<AuthUser>(API_URLS.AUTH.ME).then((r) => r.data),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
