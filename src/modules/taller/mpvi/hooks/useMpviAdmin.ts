import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ui/ToastContext";
import { mpviAdminService } from "../services/mpvi-admin.service";
import type {
  MpviCatalogoTipo,
  MpviGuardarElementoPayload,
  MpviTablaAuxiliar,
} from "../types";

export const MPVI_ADMIN_QUERY_KEYS = {
  catalogo: (tipo: MpviCatalogoTipo) => ["mpvi", "admin", "catalogo", tipo] as const,
};

export function useMpviCatalogo(tipo: MpviCatalogoTipo, enabled = true) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: MPVI_ADMIN_QUERY_KEYS.catalogo(tipo),
    queryFn: () => mpviAdminService.listarCatalogo(tipo),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    opciones: data ?? [],
    loading: isLoading,
    error: error ? "No se pudo cargar el catálogo" : null,
    refetch,
  };
}

export function useMpviAdminActions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const invalidateCatalogos = () => {
    queryClient.invalidateQueries({ queryKey: ["mpvi", "admin", "catalogo"] });
  };

  const subirPlantilla = useMutation({
    mutationFn: (archivo: File) => mpviAdminService.subirPlantilla(archivo),
    onSuccess: (data) => {
      showSuccess(`Plantilla procesada: ${data.filasProcesadas} filas`);
    },
    onError: (err: Error) => showError(err.message),
  });

  const subirTablasAux = useMutation({
    mutationFn: ({ archivo, tabla }: { archivo: File; tabla: MpviTablaAuxiliar }) =>
      mpviAdminService.subirTablasAuxiliares(archivo, tabla),
    onSuccess: (data) => {
      showSuccess(
        `Archivo procesado: ${data.filasInsertadas} insertadas, ${data.filasRechazadas} rechazadas`,
      );
    },
    onError: (err: Error) => showError(err.message),
  });

  const guardarElemento = useMutation({
    mutationFn: (payload: MpviGuardarElementoPayload) =>
      mpviAdminService.guardarElemento(payload),
    onSuccess: () => {
      showSuccess("Elemento guardado correctamente");
      invalidateCatalogos();
    },
    onError: (err: Error) => showError(err.message),
  });

  return {
    subirPlantilla,
    subirTablasAux,
    guardarElemento,
  };
}
