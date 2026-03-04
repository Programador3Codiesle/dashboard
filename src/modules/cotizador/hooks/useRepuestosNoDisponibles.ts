import { useQuery } from "@tanstack/react-query";
import {
  cotizadorRepuestosNoDispService,
  RepuestoNoDisponibleRow,
  RepuestosNoDisponiblesFiltro,
} from "../services/cotizador-repuestos-no-disp.service";

export const REPUESTOS_NO_DISPONIBLES_KEY = (f: RepuestosNoDisponiblesFiltro) =>
  [
    "cotizador",
    "repuestos-no-disponibles",
    f.dateStart,
    f.dateEnd,
    f.bodega ?? "all",
  ] as const;

export function useRepuestosNoDisponibles(filtro: RepuestosNoDisponiblesFiltro) {
  const validRange = filtro.dateStart && filtro.dateEnd && filtro.dateStart <= filtro.dateEnd;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<RepuestoNoDisponibleRow[]>({
    queryKey: REPUESTOS_NO_DISPONIBLES_KEY(filtro),
    queryFn: () => cotizadorRepuestosNoDispService.listar(filtro),
    enabled: validRange === true,
    staleTime: 2 * 60 * 1000,
  });

  return {
    filas: data ?? [],
    loading: isLoading,
    error: error
      ? (error instanceof Error ? error.message : "Error al cargar repuestos no disponibles.")
      : null,
    refetch,
    enabled: validRange === true,
  };
}
