import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/usuarios.service';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';

export const JEFES_QUERY_KEYS = {
  all: ['jefes'] as const,
  usuario: (idEmpleado: string) => ['jefes', 'usuario', idEmpleado] as const,
  misJefes: ['jefes', 'mios'] as const,
};

export const useJefes = (options?: { enabled?: boolean }) => {
  const {
    data: jefes = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: JEFES_QUERY_KEYS.all,
    queryFn: () => usuariosService.getJefes(),
    ...transactionalQueryOptions,
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });

  const error = queryError
    ? { message: (queryError as Error).message || 'Error al cargar jefes', code: 500 }
    : null;

  return { jefes, isLoading, error };
};

export const useJefesUsuario = (
  idEmpleado: string | undefined,
  enabled: boolean = true,
) => {
  const {
    data: jefes = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: JEFES_QUERY_KEYS.usuario(idEmpleado || ''),
    queryFn: () => usuariosService.getJefesUsuario(idEmpleado!),
    staleTime: 30 * 1000,
    enabled: !!idEmpleado && enabled,
  });

  const error = queryError
    ? {
        message:
          (queryError as Error).message || 'Error al cargar jefes del usuario',
        code: 500,
      }
    : null;

  return { jefes, isLoading, error, refetch };
};

export const useMisJefes = (options?: { enabled?: boolean }) => {
  const {
    data: jefes = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: JEFES_QUERY_KEYS.misJefes,
    queryFn: () => usuariosService.getMisJefes(),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });

  const error = queryError
    ? {
        message:
          (queryError as Error).message || 'Error al cargar jefes del usuario',
        code: 500,
      }
    : null;

  return { jefes, isLoading, error };
};
