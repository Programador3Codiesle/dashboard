import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ui/ToastContext";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { mpviJefeTallerService } from "../services/mpvi-jefe-taller.service";
import type { MpviGuardarServicioPayload } from "../types";

export const MPVI_JEFE_QUERY_KEYS = {
  datosServicio: (op: number, idCotizacion: number) =>
    ["mpvi", "jefe-taller", "datos-servicio", op, idCotizacion] as const,
};

export function useMpviDatosServicio(op: number, idCotizacion: number | null) {
  const enabled = idCotizacion != null && idCotizacion > 0;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: enabled
      ? MPVI_JEFE_QUERY_KEYS.datosServicio(op, idCotizacion!)
      : ["mpvi", "jefe-taller", "datos-servicio", "idle"],
    queryFn: () =>
      mpviJefeTallerService.obtenerDatosServicio({
        op,
        idCotizacion: idCotizacion!,
      }),
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    datos: data,
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useMpviJefeTallerActions() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const empresa = user?.empresa;

  const guardarServicio = useMutation({
    mutationFn: (payload: MpviGuardarServicioPayload) =>
      mpviJefeTallerService.guardarServicio(payload),
    onSuccess: (result) => {
      if (!result.ok) {
        showError("No se pudo guardar el servicio");
        return;
      }
      showSuccess("Servicio guardado correctamente");
    },
    onError: (err: Error) => showError(err.message),
  });

  return {
    guardarServicio,
    abrirPdf: (idCotizacion: number, tipo: number) =>
      mpviJefeTallerService.abrirPdf(idCotizacion, tipo, empresa),
  };
}
