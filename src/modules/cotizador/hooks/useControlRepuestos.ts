import { useQuery } from "@tanstack/react-query";
import {
  cotizadorControlService,
  FilaControlRepuesto,
} from "../services/cotizador-control.service";

export const CONTROL_REPUESTOS_KEY = ["cotizador", "control", "repuestos"] as const;

export function useControlRepuestos() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<FilaControlRepuesto[]>({
    queryKey: CONTROL_REPUESTOS_KEY,
    queryFn: () => cotizadorControlService.getControlRepuestos(),
    staleTime: 2 * 60 * 1000,
  });

  return {
    filas: data ?? [],
    loading: isLoading,
    error: error
      ? (error instanceof Error ? error.message : "Error al cargar control de repuestos.")
      : null,
    refetch,
  };
}
