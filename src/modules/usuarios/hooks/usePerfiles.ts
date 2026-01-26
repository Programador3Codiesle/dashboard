import { useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/usuarios.service';
import { IPerfil } from '../types';

// Query keys para perfiles
export const PERFILES_QUERY_KEYS = {
  all: ['perfiles'] as const,
  usuario: (nit: string) => ['perfiles', 'usuario', nit] as const,
};

/**
 * Hook optimizado con React Query para obtener todos los perfiles
 * - Caché de 15 minutos (datos muy estáticos)
 */
export const usePerfiles = (options?: { enabled?: boolean }) => {
  const { 
    data: perfiles = [], 
    isLoading, 
    error: queryError 
  } = useQuery({
    queryKey: PERFILES_QUERY_KEYS.all,
    queryFn: () => usuariosService.getPerfiles(),
    staleTime: 15 * 60 * 1000, // 15 minutos
    enabled: options?.enabled ?? true,
  });

  const error = queryError 
    ? { message: (queryError as Error).message || 'Error al cargar perfiles', code: 500 } 
    : null;

  return { perfiles, isLoading, error };
};

/**
 * Hook optimizado con React Query para obtener el perfil de un usuario específico
 * - Caché de 5 minutos
 * - Solo se ejecuta si nit está definido y enabled es true
 */
export const usePerfilUsuario = (nit: string | undefined, enabled: boolean = true) => {
  const { 
    data, 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: PERFILES_QUERY_KEYS.usuario(nit || ''),
    queryFn: async () => {
      const data = await usuariosService.getPerfilUsuario(nit!);
      return data.length > 0 ? data[0] : null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!nit && enabled,
  });

  const error = queryError 
    ? { message: (queryError as Error).message || 'Error al cargar perfil del usuario', code: 500 } 
    : null;

  return { perfil: data ?? null, isLoading, error, refetch };
};

