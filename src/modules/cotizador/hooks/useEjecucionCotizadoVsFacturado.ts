import { useQuery } from "@tanstack/react-query";
import {
  cotizadorEjecucionService,
  EjecucionFiltro,
  EjecucionResumenResponse,
  FilaCotizacionToFacturado,
  FilaFacturadoToCotizacion,
} from "../services/cotizador-ejecucion.service";

export const EJECUCION_RESUMEN_KEY = (f: EjecucionFiltro) =>
  ["cotizador", "ejecucion", "resumen", f.dateStart, f.dateEnd, f.bodega ?? "all"] as const;

export const EJECUCION_COTIZACION_TO_FACTURADO_KEY = (f: EjecucionFiltro) =>
  ["cotizador", "ejecucion", "cotizacion-to-facturado", f.dateStart, f.dateEnd, f.bodega ?? "all"] as const;

export const EJECUCION_FACTURADO_TO_COTIZACION_KEY = (f: EjecucionFiltro) =>
  ["cotizador", "ejecucion", "facturado-to-cotizacion", f.dateStart, f.dateEnd, f.bodega ?? "all"] as const;

export function useEjecucionResumen(filtro: EjecucionFiltro) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<EjecucionResumenResponse>({
    queryKey: EJECUCION_RESUMEN_KEY(filtro),
    queryFn: () => cotizadorEjecucionService.getResumen(filtro),
    enabled: !!filtro.dateStart && !!filtro.dateEnd,
    staleTime: 2 * 60 * 1000,
  });

  return {
    resumen: data?.resumen,
    totales: data?.totales,
    loading: isLoading,
    error: error ? "No se pudo cargar el resumen de ejecución." : null,
    refetch,
  };
}

export function useEjecucionCotizacionToFacturado(filtro: EjecucionFiltro) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<FilaCotizacionToFacturado[]>({
    queryKey: EJECUCION_COTIZACION_TO_FACTURADO_KEY(filtro),
    queryFn: () => cotizadorEjecucionService.getCotizacionToFacturado(filtro),
    enabled: !!filtro.dateStart && !!filtro.dateEnd,
    staleTime: 2 * 60 * 1000,
  });

  return {
    filas: data ?? [],
    loading: isLoading,
    error: error ? "No se pudo cargar la tabla Cotizado a Facturado." : null,
    refetch,
  };
}

export function useEjecucionFacturadoToCotizacion(filtro: EjecucionFiltro) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<FilaFacturadoToCotizacion[]>({
    queryKey: EJECUCION_FACTURADO_TO_COTIZACION_KEY(filtro),
    queryFn: () => cotizadorEjecucionService.getFacturadoToCotizacion(filtro),
    enabled: !!filtro.dateStart && !!filtro.dateEnd,
    staleTime: 2 * 60 * 1000,
  });

  return {
    filas: data ?? [],
    loading: isLoading,
    error: error ? "No se pudo cargar la tabla Facturado a Cotizado." : null,
    refetch,
  };
}

