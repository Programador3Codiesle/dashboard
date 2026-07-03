import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ui/ToastContext";
import { mpviContactService } from "../services/mpvi-contact.service";
import type { MpviObtenerCotizacionesPayload } from "../types";

export const MPVI_CONTACT_QUERY_KEYS = {
  cotizaciones: (filtro: MpviObtenerCotizacionesPayload) =>
    ["mpvi", "contact", "cotizaciones", filtro] as const,
};

export function useMpviCotizaciones(filtro: MpviObtenerCotizacionesPayload = {}) {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: MPVI_CONTACT_QUERY_KEYS.cotizaciones(filtro),
    queryFn: () => mpviContactService.obtenerCotizaciones(filtro),
    staleTime: 60 * 1000,
  });

  return {
    cotizaciones: data?.cotizaciones ?? [],
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useMpviContactActions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const descartar = useMutation({
    mutationFn: (idCotizacion: number) =>
      mpviContactService.descartarCotizacion({ idCotizacion }),
    onSuccess: (result) => {
      if (!result.ok) {
        showError("No se pudo descartar la cotización");
        return;
      }
      showSuccess("Cotización descartada");
      queryClient.invalidateQueries({ queryKey: ["mpvi", "contact"] });
    },
    onError: (err: Error) => showError(err.message),
  });

  return { descartar };
}
