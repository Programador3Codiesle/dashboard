import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardData } from "../types";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

export interface UseDashboardOptions {
  enabled?: boolean;
  idsede?: number;
}

export function useDashboard(
  userId: string | undefined,
  options?: UseDashboardOptions
) {
  const enabled = !!userId && (options?.enabled !== false);
  const idsede = options?.idsede;
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: [...DASHBOARD_QUERY_KEY, userId, idsede],
    queryFn: () => dashboardService.getDashboard(idsede),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
