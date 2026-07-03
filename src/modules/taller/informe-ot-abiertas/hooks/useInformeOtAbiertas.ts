import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { informeOtAbiertasService } from "../services/informe-ot-abiertas.service";

export const INFORME_OT_ABIERTAS_QUERY_KEYS = {
  general: ["taller", "informe-ot-abiertas", "general"] as const,
  sede: (sede: string) =>
    ["taller", "informe-ot-abiertas", "sede", sede] as const,
  taller: (bodegaId: number) =>
    ["taller", "informe-ot-abiertas", "taller", bodegaId] as const,
};

export function useInformeOtAbiertasGeneral() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: INFORME_OT_ABIERTAS_QUERY_KEYS.general,
    queryFn: () => informeOtAbiertasService.obtenerGeneral(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  return {
    data,
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useInformeOtAbiertasPorSede(sede: string, enabled = true) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: INFORME_OT_ABIERTAS_QUERY_KEYS.sede(sede),
    queryFn: () => informeOtAbiertasService.obtenerPorSede(sede),
    enabled: enabled && !!sede,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  return {
    data,
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useInformeOtAbiertasPorTaller(bodegaId: number, enabled = true) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: INFORME_OT_ABIERTAS_QUERY_KEYS.taller(bodegaId),
    queryFn: () => informeOtAbiertasService.obtenerPorTaller(bodegaId),
    enabled: enabled && Number.isFinite(bodegaId) && bodegaId > 0,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  return {
    data,
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
