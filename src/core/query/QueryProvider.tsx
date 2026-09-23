'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

function axiosLikeStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return undefined;
  }
  const response = (error as { response?: { status?: number } }).response;
  return response?.status;
}

/**
 * QueryProvider - Proveedor de React Query para gestión de estado de servidor
 *
 * Configuración optimizada para:
 * - staleTime: 5 minutos - datos considerados frescos
 * - gcTime: 10 minutos - tiempo de caché garbage collection
 * - retry: 2 (1 extra en 502/503/504; fetch/axios ya cubre el hueco de PM2)
 * - refetchOnMount: false - evita refetch al navegar entre módulos
 * - refetchOnWindowFocus: false - no refetch al cambiar de pestaña
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: (failureCount, error) => {
              const status = axiosLikeStatus(error);
              if (status === 401 || status === 403) {
                return false;
              }
              if (status === 502 || status === 503 || status === 504) {
                return failureCount < 1;
              }
              return failureCount < 2;
            },
            retryDelay: (attemptIndex) => Math.min(400 * 2 ** attemptIndex, 4000),
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
