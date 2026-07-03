import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ui/ToastContext";
import { estadoTallerService } from "../services/estado-taller.service";
import type {
  AgregarEventoPayload,
  FacturaMesActualPayload,
  ValoresEstimadosPayload,
} from "../types/estado-taller.types";

export const ESTADO_TALLER_QUERY_KEYS = {
  panel: (bodega: string, empresa?: number) =>
    ["taller", "estado-taller", "panel", bodega, empresa ?? "all"] as const,
  estados: ["taller", "estado-taller", "estados"] as const,
  historial: (numeroOrden: number) =>
    ["taller", "estado-taller", "historial", numeroOrden] as const,
};

export function useEstadoTallerPanel(bodega: string, empresa?: number) {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ESTADO_TALLER_QUERY_KEYS.panel(bodega, empresa),
    queryFn: () => estadoTallerService.obtenerPanel(bodega, empresa),
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

  return {
    panel: data,
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useEstadosOtCatalogo(enabled = true) {
  return useQuery({
    queryKey: ESTADO_TALLER_QUERY_KEYS.estados,
    queryFn: () => estadoTallerService.obtenerEstadosCatalogo(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useHistorialOt(numeroOrden: number | null) {
  return useQuery({
    queryKey: ESTADO_TALLER_QUERY_KEYS.historial(numeroOrden ?? 0),
    queryFn: () => estadoTallerService.obtenerHistorial(numeroOrden!),
    enabled: numeroOrden != null,
    refetchOnWindowFocus: false,
  });
}

export function useAgregarEventoOt() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (payload: AgregarEventoPayload) =>
      estadoTallerService.agregarEvento(payload),
    onSuccess: (result) => {
      if (result.ok) {
        showSuccess("Evento agregado correctamente");
        queryClient.invalidateQueries({ queryKey: ["taller", "estado-taller"] });
      } else {
        showError("Ha ocurrido un error inesperado");
      }
    },
    onError: (err: Error) => showError(err.message),
  });
}

export function useGuardarFacturaMesActual() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (payload: FacturaMesActualPayload) =>
      estadoTallerService.guardarFacturaMesActual(payload),
    onSuccess: (result) => {
      if (result.ok) {
        showSuccess(result.message);
        queryClient.invalidateQueries({ queryKey: ["taller", "estado-taller"] });
      } else {
        showError(result.message);
      }
    },
    onError: (err: Error) => showError(err.message),
  });
}

export function useGuardarValoresEstimados() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (payload: ValoresEstimadosPayload) =>
      estadoTallerService.guardarValoresEstimados(payload),
    onSuccess: (result) => {
      if (result.ok) {
        showSuccess(result.message);
        queryClient.invalidateQueries({ queryKey: ["taller", "estado-taller"] });
      } else {
        showError(result.message);
      }
    },
    onError: (err: Error) => showError(err.message),
  });
}
