import axios from "axios";
import { APP_ROUTES } from "@/constants/routes";

export const publicApi = axios.create({ baseURL: "/" });

export const privateApi = axios.create({
  baseURL: "/",
  withCredentials: true,
});

privateApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthPage =
    window.location.pathname === APP_ROUTES.LOGIN ||
    window.location.pathname === APP_ROUTES.SIGNUP;
    if (error.response?.status === 401 && !isAuthPage) {
      window.location.href = APP_ROUTES.LOGIN;
    }
    return Promise.reject(error);
  },
);
