import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { AuthUser } from "@/context/AuthContext";

interface LoginBody {
  email: string;
  password: string;
}

export function useLogin() {
  return useMutation<AuthUser, Error, LoginBody>({
    mutationFn: (body) =>
      publicApi.post<AuthUser>(API_URLS.AUTH.LOGIN, body).then((r) => r.data),
  });
}
