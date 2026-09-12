import { useQuery } from '@tanstack/react-query';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { usuariosService } from '../services/usuarios.service';

export const MI_PERFIL_QUERY_KEY = ['usuarios', 'mi-perfil'] as const;

export function useMiPerfil(enabled: boolean) {
  const query = useQuery({
    queryKey: MI_PERFIL_QUERY_KEY,
    queryFn: () => usuariosService.getMiPerfil(),
    enabled,
    staleTime: 5 * 60 * 1000,
    ...transactionalQueryOptions,
  });

  return {
    perfil: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error
      ? (query.error as Error).message || 'Error al cargar el perfil'
      : null,
  };
}
