import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IUsuario, IUsuariosPaginatedResponseAPI } from '@/modules/usuarios/types';
import { usuariosService } from '../services/usuarios.service';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { USUARIOS_PAGE_SIZE } from '../constants';

type UsuariosListado = Omit<IUsuariosPaginatedResponseAPI, 'items'> & {
  items: IUsuario[];
};

// Query key para usuarios
export const USUARIOS_QUERY_KEY = ['usuarios'] as const;

/**
 * Hook optimizado con React Query para gestión de usuarios
 * - Caché automática de 5 minutos
 * - Retry automático en caso de error
 * - Paginación real en backend (page, limit)
 */
export const useUsuarios = (
  page: number = 1,
  limit: number = USUARIOS_PAGE_SIZE,
  search: string = '',
) => {
  const queryClient = useQueryClient();
  const queryKey = [...USUARIOS_QUERY_KEY, page, limit, search];

  const { 
    data,
    isLoading, 
    isFetching,
    error,
    refetch 
  } = useQuery({
    queryKey,
    queryFn: () => usuariosService.getUsuarios(page, limit, search),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    ...transactionalQueryOptions,
    placeholderData: (previousData) => previousData,
  });

  const usuarios = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Función para actualizar el cache manualmente (para optimistic updates)
  const setUsuarios = (newUsuarios: IUsuario[] | ((prev: IUsuario[]) => IUsuario[])) => {
    queryClient.setQueryData(queryKey, (old: UsuariosListado | undefined) => {
      const prevItems: IUsuario[] = old?.items || [];
      if (typeof newUsuarios === 'function') {
        return {
          ...(old || {}),
          items: newUsuarios(prevItems),
        };
      }
      return {
        ...(old || {}),
        items: newUsuarios,
      };
    });
  };

  return { 
    usuarios, 
    total,
    totalPages,
    isLoading, 
    isFetching,
    error: error ? { message: (error as Error).message || 'Error al cargar usuarios', code: 500 } : null, 
    refetch, 
    setUsuarios 
  };
};
