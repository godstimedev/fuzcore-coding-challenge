import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useQueryClient } from "@tanstack/react-query";
import { APP_ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { LayoutDashboard, Users, ArrowLeftRight, FileText, LogOut, BookOpen, Tag } from "lucide-react";

const NAV_LINKS = [
  { label: "Dashboard", href: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Customers", href: APP_ROUTES.CUSTOMERS, icon: Users },
  { label: "Transactions", href: APP_ROUTES.TRANSACTIONS, icon: ArrowLeftRight },
  { label: "Categories", href: APP_ROUTES.CATEGORIES, icon: Tag },
  { label: "Invoices", href: APP_ROUTES.INVOICES, icon: FileText },
];

function Navbar() {
  const { user, setUser } = useAuth();
  const [location] = useLocation();
  const qc = useQueryClient();
  const { mutate: logout, isPending } = useLogout();

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => {
        setUser(null);
        qc.clear();
        toast.success("Logged out successfully");
        window.location.href = APP_ROUTES.LOGIN;
      },
      onError: () => toast.error("Logout failed"),
    });
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href={APP_ROUTES.DASHBOARD} className="flex items-center gap-2 font-bold text-neutral-900">
            <BookOpen className="w-5 h-5" />
            <span>FuzAccounts</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === href
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-neutral-500 hidden sm:block">
                {user.name ?? user.email}
              </span>
              <button
                onClick={handleLogout}
                disabled={isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href={APP_ROUTES.LOGIN}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href={APP_ROUTES.SIGNUP}
                className="text-sm font-medium bg-neutral-900 text-white px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
