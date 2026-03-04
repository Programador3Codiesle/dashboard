import { useQuery } from "@tanstack/react-query";
import {
  cotizadorPesadosService,
  MantenimientoPesadosResponse,
  PesadosInfoClientResponse,
  PesadosInitData,
} from "../services/cotizador-pesados.service";

export const COTIZADOR_PESADOS_QUERY_KEYS = {
  init: ["cotizador", "pesados", "init"] as const,
  infoClient: (placa: string) => ["cotizador", "pesados", "info-client", placa] as const,
  mantenimiento: (clase: string, revision: number, bodega: number, yearModel: number) =>
    ["cotizador", "pesados", "mantenimiento", clase, revision, bodega, yearModel] as const,
};

export function useCotizadorPesadosInit() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<PesadosInitData>({
    queryKey: COTIZADOR_PESADOS_QUERY_KEYS.init,
    queryFn: () => cotizadorPesadosService.getInitData(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    data,
    loading: isLoading,
    error: error ? "No se pudo cargar la configuración inicial de pesados." : null,
    refetch,
  };
}

export function usePesadosInfoClient(placa: string | null) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<PesadosInfoClientResponse>({
    queryKey: COTIZADOR_PESADOS_QUERY_KEYS.infoClient(placa || ""),
    queryFn: () => cotizadorPesadosService.getInfoClient(placa || ""),
    enabled: !!placa,
    staleTime: 2 * 60 * 1000,
  });

  return {
    info: data,
    loading: isLoading,
    error: error ? "No se pudo obtener la información del vehículo de pesados." : null,
    refetch,
  };
}

export function useMantenimientoPesados(params: {
  clase: string | null;
  revision: number | null;
  bodega: number | null;
  yearModel: number | null;
  enabled?: boolean;
}) {
  const enabled =
    params.enabled &&
    !!params.clase &&
    params.revision != null &&
    params.bodega != null &&
    params.yearModel != null;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<MantenimientoPesadosResponse>({
    queryKey: COTIZADOR_PESADOS_QUERY_KEYS.mantenimiento(
      (params.clase || "") as string,
      (params.revision ?? 0) as number,
      (params.bodega ?? 0) as number,
      (params.yearModel ?? 0) as number
    ),
    queryFn: () =>
      cotizadorPesadosService.getMantenimiento({
        clase: params.clase as string,
        revision: params.revision as number,
        bodega: params.bodega as number,
        yearModel: params.yearModel as number,
      }),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  return {
    mantenimiento: data,
    loading: isLoading,
    error: error ? "No se pudo cargar el mantenimiento de la revisión seleccionada." : null,
    refetch,
  };
}

