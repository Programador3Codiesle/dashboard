import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardData } from "../types";

export const DASHBOARD_QUERY_KEY = ["dashboard"] as const;

export interface UseDashboardOptions {
  enabled?: boolean;
  idsede?: number;
  mes?: number;
  ano?: number;
}

export function useDashboard(
  userId: string | undefined,
  options?: UseDashboardOptions
) {
  const enabled = !!userId && (options?.enabled !== false);
  const idsede = options?.idsede;
  const mes = options?.mes;
  const ano = options?.ano;
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<DashboardData>({
    queryKey: [...DASHBOARD_QUERY_KEY, userId, idsede, mes, ano],
    queryFn: () => dashboardService.getDashboard({ idsede, mes, ano }),
    enabled,
    staleTime: 2 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
