'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * QueryProvider - Proveedor de React Query para gestión de estado de servidor
 *
 * Configuración optimizada para:
 * - staleTime: 5 minutos - datos considerados frescos
 * - gcTime: 10 minutos - tiempo de caché garbage collection
 * - retry: 2 - reintentos automáticos en caso de error
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
            retry: 2,
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
