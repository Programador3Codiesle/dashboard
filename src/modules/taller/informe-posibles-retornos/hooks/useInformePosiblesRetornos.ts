import { useQuery } from "@tanstack/react-query";
import { informePosiblesRetornosService } from "../services/informe-posibles-retornos.service";
import type { GetGraficoParams } from "../types";

export const INFORME_POSIBLES_RETORNOS_QUERY_KEYS = {
  catalogos: ["taller", "informe-posibles-retornos", "catalogos"] as const,
  grafico: (params: GetGraficoParams) =>
    ["taller", "informe-posibles-retornos", "grafico", params] as const,
};

export function useInformePosiblesRetornosCatalogos(enabled = true) {
  const { data, isLoading, error } = useQuery({
    queryKey: INFORME_POSIBLES_RETORNOS_QUERY_KEYS.catalogos,
    queryFn: () => informePosiblesRetornosService.obtenerCatalogos(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });

  return {
    catalogos: data,
    loadingCatalogos: isLoading,
    errorCatalogos: error instanceof Error ? error.message : null,
  };
}

export function useInformePosiblesRetornosGrafico(
  params: GetGraficoParams,
  enabled = true,
) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: INFORME_POSIBLES_RETORNOS_QUERY_KEYS.grafico(params),
    queryFn: () => informePosiblesRetornosService.obtenerGrafico(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
    enabled,
  });

  return {
    grafico: data,
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
