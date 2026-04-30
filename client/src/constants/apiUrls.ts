export const API_URLS = {
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
  },
  CUSTOMERS: {
    BASE: "/api/customers",
    BY_ID: (id: string) => `/api/customers/${id}`,
  },
  CATEGORIES: {
    BASE: "/api/categories",
    BY_ID: (id: string) => `/api/categories/${id}`,
  },
  TRANSACTIONS: {
    BASE: "/api/transactions",
    BY_ID: (id: string) => `/api/transactions/${id}`,
  },
  INVOICES: {
    BASE: "/api/invoices",
    BY_ID: (id: string) => `/api/invoices/${id}`,
  },
  AI: {
    CATEGORIZE: "/api/ai/categorize",
  },
  DASHBOARD: {
    SUMMARY: "/api/dashboard/summary",
  },
} as const;
