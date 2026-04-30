import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { APP_ROUTES } from "@/constants/routes";
import type { ReactNode } from "react";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Redirect to={APP_ROUTES.LOGIN} />;

  return <>{children}</>;
}
