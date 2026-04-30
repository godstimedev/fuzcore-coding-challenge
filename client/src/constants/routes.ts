export const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  CUSTOMERS: "/customers",
  TRANSACTIONS: "/transactions",
  CATEGORIES: "/categories",
  INVOICES: "/invoices",
  INVOICES_NEW: "/invoices/new",
  INVOICE_DETAIL: (id: string) => `/invoices/${id}`,
  INVOICE_EDIT: (id: string) => `/invoices/${id}/edit`,
} as const;
