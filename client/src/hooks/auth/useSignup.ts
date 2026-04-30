import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";
import type { AuthUser } from "@/context/AuthContext";

interface SignupBody {
  email: string;
  password: string;
  name?: string;
}

export function useSignup() {
  return useMutation<AuthUser, Error, SignupBody>({
    mutationFn: (body) =>
      publicApi.post<AuthUser>(API_URLS.AUTH.SIGNUP, body).then((r) => r.data),
  });
}
