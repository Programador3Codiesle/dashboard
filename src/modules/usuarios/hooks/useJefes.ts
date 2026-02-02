import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/usuarios.service';
import { IJefe } from '../types';

// Query keys para jefes
export const JEFES_QUERY_KEYS = {
  all: ['jefes'] as const,
  usuario: (idEmpleado: string) => ['jefes', 'usuario', idEmpleado] as const,
  misJefes: ['jefes', 'mios'] as const,
};

/**
 * Hook optimizado con React Query para obtener todos los jefes
 * - Caché de 10 minutos (datos estáticos)
 */
export const useJefes = (options?: { enabled?: boolean }) => {
  const { 
    data: jefes = [], 
    isLoading, 
    error: queryError 
  } = useQuery({
    queryKey: JEFES_QUERY_KEYS.all,
    queryFn: () => usuariosService.getJefes(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    enabled: options?.enabled ?? true,
  });

  const error = queryError 
    ? { message: (queryError as Error).message || 'Error al cargar jefes', code: 500 } 
    : null;

  return { jefes, isLoading, error };
};

/**
 * Hook optimizado con React Query para obtener jefes de un usuario específico
 * - Caché de 5 minutos
 * - Solo se ejecuta si idEmpleado está definido y enabled es true
 */
export const useJefesUsuario = (idEmpleado: string | undefined, enabled: boolean = true) => {
  const { 
    data: jefes = [], 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: JEFES_QUERY_KEYS.usuario(idEmpleado || ''),
    queryFn: () => usuariosService.getJefesUsuario(idEmpleado!),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!idEmpleado && enabled,
  });

  const error = queryError 
    ? { message: (queryError as Error).message || 'Error al cargar jefes del usuario', code: 500 } 
    : null;

  return { jefes, isLoading, error, refetch };
};

/**
 * Hook para obtener los jefes del usuario autenticado (usando /usuarios/mis-jefes).
 */
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
    ? { message: (queryError as Error).message || 'Error al cargar jefes del usuario', code: 500 }
    : null;

  return { jefes, isLoading, error };
};


