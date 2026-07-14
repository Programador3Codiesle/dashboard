/** Opciones React Query para catálogos estáticos (perfiles, sedes, jefes, etc.). */
export const CATALOG_QUERY_STALE_MS = 15 * 60 * 1000;

export const catalogQueryOptions = {
  staleTime: CATALOG_QUERY_STALE_MS,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
} as const;

/** Datos transaccionales que deben refrescarse al remontar si están stale. */
export const transactionalQueryOptions = {
  refetchOnMount: true,
} as const;
