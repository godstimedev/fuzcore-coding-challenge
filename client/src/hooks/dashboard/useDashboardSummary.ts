import { useQuery } from "@tanstack/react-query";
import { privateApi } from "@/lib/axios";
import { API_URLS } from "@/constants/apiUrls";

export interface MonthlyDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  income: number;
}

export interface DashboardSummary {
  revenue: number;
  expenses: number;
  outstanding: number;
  income: number;
  monthly: MonthlyDataPoint[];
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: () =>
      privateApi.get<DashboardSummary>(API_URLS.DASHBOARD.SUMMARY).then((r) => r.data),
  });
}
