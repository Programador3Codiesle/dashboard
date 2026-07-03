import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ui/ToastContext";
import { entradaVehiculoService } from "../services/entrada-vehiculo.service";
import type {
  MarcarEntradaPayload,
  VehiculoSinCitaPayload,
} from "../types/entrada-vehiculo.types";

export const ENTRADA_VEHICULO_QUERY_KEYS = {
  panel: (placa?: string) =>
    ["taller", "entrada-vehiculo", "panel", placa?.trim().toUpperCase() ?? ""] as const,
  citasFecha: (fecha: string) =>
    ["taller", "entrada-vehiculo", "citas-fecha", fecha] as const,
};

export function useEntradaVehiculoPanel(placaBusqueda?: string | null) {
  const placa =
    placaBusqueda && placaBusqueda.trim().length >= 6
      ? placaBusqueda.trim().toUpperCase()
      : undefined;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ENTRADA_VEHICULO_QUERY_KEYS.panel(placa),
    queryFn: () => entradaVehiculoService.obtenerPanel(placa),
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    panel: data,
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useCitasProgramadasPorFecha(fecha: string | null) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: fecha
      ? ENTRADA_VEHICULO_QUERY_KEYS.citasFecha(fecha)
      : ["taller", "entrada-vehiculo", "citas-fecha", "idle"],
    queryFn: () => entradaVehiculoService.obtenerCitasProgramadasPorFecha(fecha!),
    enabled: !!fecha,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    citas: data ?? [],
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useMarcarEntrada() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (payload: MarcarEntradaPayload) =>
      entradaVehiculoService.marcarEntrada(payload),
    onSuccess: (result) => {
      if (result.ok) {
        showSuccess("Registro agregado correctamente");
        queryClient.invalidateQueries({ queryKey: ["taller", "entrada-vehiculo"] });
      } else {
        showError("Error al crear el registro");
      }
    },
    onError: (err: Error) => {
      showError(err.message || "Error al marcar la entrada");
    },
  });
}

export function useRegistrarVehiculoSinCita() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (payload: VehiculoSinCitaPayload) =>
      entradaVehiculoService.registrarVehiculoSinCita(payload),
    onSuccess: (result) => {
      if (result.ok) {
        showSuccess("Vehículo añadido exitosamente");
        queryClient.invalidateQueries({ queryKey: ["taller", "entrada-vehiculo"] });
      } else {
        showError("No se insertó el vehículo");
      }
    },
    onError: (err: Error) => {
      showError(err.message || "No se pudo registrar el vehículo");
    },
  });
}
