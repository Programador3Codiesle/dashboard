import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IUsuario } from '@/modules/usuarios/types';
import { usuariosService } from '../services/usuarios.service';

// Query key para usuarios
export const USUARIOS_QUERY_KEY = ['usuarios'] as const;

/**
 * Hook optimizado con React Query para gestión de usuarios
 * - Caché automática de 5 minutos
 * - Retry automático en caso de error
 * - Sincronización entre componentes
 * - Cancelación automática de peticiones
 */
export const useUsuarios = () => {
  const queryClient = useQueryClient();

  const { 
    data: usuarios = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: USUARIOS_QUERY_KEY,
    queryFn: () => usuariosService.getUsuarios(),
    staleTime: 30 * 1000, // 30 segundos - más reactivo para cambios frecuentes
    gcTime: 5 * 60 * 1000, // Mantener en caché por 5 minutos (garbage collection)
  });

  // Función para actualizar el cache manualmente (para optimistic updates)
  const setUsuarios = (newUsuarios: IUsuario[] | ((prev: IUsuario[]) => IUsuario[])) => {
    queryClient.setQueryData(USUARIOS_QUERY_KEY, (old: IUsuario[] | undefined) => {
      if (typeof newUsuarios === 'function') {
        return newUsuarios(old || []);
      }
      return newUsuarios;
    });
  };

  return { 
    usuarios, 
    isLoading, 
    error: error ? { message: (error as Error).message || 'Error al cargar usuarios', code: 500 } : null, 
    refetch, 
    setUsuarios 
  };
};
