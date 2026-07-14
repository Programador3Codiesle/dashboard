/** Opciones React Query para módulos Contact Center (datos de catálogo / matriz). */
export const CC_QUERY_STALE_MS = 5 * 60 * 1000;

export const ccQueryOptions = {
  staleTime: CC_QUERY_STALE_MS,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const;
