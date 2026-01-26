import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/usuarios.service';
import { ISede } from '../types';

// Query keys para sedes
export const SEDES_QUERY_KEYS = {
  all: ['sedes'] as const,
  usuario: (usuarioId: string) => ['sedes', 'usuario', usuarioId] as const,
};

/**
 * Hook optimizado con React Query para obtener todas las sedes
 * - Caché de 15 minutos (datos muy estáticos)
 */
export const useSedes = (options?: { enabled?: boolean }) => {
  const { 
    data: sedes = [], 
    isLoading, 
    error: queryError 
  } = useQuery({
    queryKey: SEDES_QUERY_KEYS.all,
    queryFn: () => usuariosService.getSedes(),
    staleTime: 15 * 60 * 1000, // 15 minutos
    enabled: options?.enabled ?? true,
  });

  const error = queryError 
    ? { message: (queryError as Error).message || 'Error al cargar sedes', code: 500 } 
    : null;

  return { sedes, isLoading, error };
};

/**
 * Hook optimizado con React Query para obtener sedes de un usuario específico
 * - Caché de 5 minutos
 * - Solo se ejecuta si usuarioId está definido y enabled es true
 */
export const useSedesUsuario = (usuarioId: string | undefined, enabled: boolean = true) => {
  const { 
    data: sedes = [], 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: SEDES_QUERY_KEYS.usuario(usuarioId || ''),
    queryFn: () => usuariosService.getSedesUsuario(usuarioId!),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!usuarioId && enabled,
  });

  const error = queryError 
    ? { message: (queryError as Error).message || 'Error al cargar sedes del usuario', code: 500 } 
    : null;

  return { sedes, isLoading, error, refetch };
};

