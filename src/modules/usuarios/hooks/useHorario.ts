import { useQuery } from "@tanstack/react-query";
import { usuariosService } from "../services/usuarios.service";

export const HORARIO_QUERY_KEYS = {
  usuario: (nit: string) => ["horario", "usuario", nit] as const,
};

export const useHorarioUsuario = (
  nit: string | undefined,
  enabled: boolean = true,
) => {
  const {
    data: horario = null,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: HORARIO_QUERY_KEYS.usuario(nit || ""),
    queryFn: () => usuariosService.getHorario(nit!),
    staleTime: 5 * 60 * 1000,
    enabled: !!nit && enabled,
  });

  const error = queryError
    ? {
        message:
          (queryError as Error).message || "Error al cargar horario del usuario",
        code: 500,
      }
    : null;

  return { horario, isLoading, error, refetch };
};
