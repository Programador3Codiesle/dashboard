import { useQuery } from "@tanstack/react-query";
import { usuariosService } from "../services/usuarios.service";
import { catalogQueryOptions } from "@/core/query/catalog-query-options";

export const JEFES_GENERAL_QUERY_KEY = ["jefes-general"] as const;
export const USUARIOS_JEFES_QUERY_KEY = ["usuarios-jefes"] as const;

export const useJefesGeneral = (options?: { enabled?: boolean }) => {
  const {
    data: jefes = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: JEFES_GENERAL_QUERY_KEY,
    queryFn: () => usuariosService.getJefesGeneral(),
    ...catalogQueryOptions,
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });

  const error = queryError
    ? {
        message: (queryError as Error).message || "Error al cargar jefes generales",
        code: 500,
      }
    : null;

  return { jefes, isLoading, error, refetch };
};

export const useUsuariosJefes = (options?: { enabled?: boolean }) => {
  const {
    data: usuarios = [],
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: USUARIOS_JEFES_QUERY_KEY,
    queryFn: () => usuariosService.getUsuariosJefes(),
    ...catalogQueryOptions,
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });

  const error = queryError
    ? {
        message:
          (queryError as Error).message ||
          "Error al cargar usuarios candidatos a jefe",
        code: 500,
      }
    : null;

  return { usuarios, isLoading, error, refetch };
};
