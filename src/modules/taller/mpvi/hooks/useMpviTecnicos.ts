import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/shared/ui/ToastContext";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { mpviTecnicosService } from "../services/mpvi-tecnicos.service";
import type {
  MpviGuardarTecnicoPayload,
  MpviObtenerDatosPayload,
} from "../types";

export const MPVI_TECNICOS_QUERY_KEYS = {
  items: (placa: string) => ["mpvi", "tecnicos", "items", placa] as const,
  datos: (payload: MpviObtenerDatosPayload) =>
    ["mpvi", "tecnicos", "datos", payload] as const,
  stock: (codRepuesto: string) => ["mpvi", "tecnicos", "stock", codRepuesto] as const,
};

export function useMpviItems(placa: string | null) {
  const placaNorm = placa?.trim().toUpperCase() ?? "";

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: MPVI_TECNICOS_QUERY_KEYS.items(placaNorm),
    queryFn: () => mpviTecnicosService.obtenerItems({ placa: placaNorm }),
    enabled: placaNorm.length === 6,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    data,
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : error ? "Error al consultar placa" : null,
    refetch,
  };
}

export function useMpviDatos(payload: MpviObtenerDatosPayload | null) {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: payload
      ? MPVI_TECNICOS_QUERY_KEYS.datos(payload)
      : ["mpvi", "tecnicos", "datos", "idle"],
    queryFn: () => mpviTecnicosService.obtenerDatos(payload!),
    enabled: !!payload,
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

export function useMpviStock(codRepuesto: string | null) {
  const cod = codRepuesto?.trim() ?? "";

  const { data, isLoading } = useQuery({
    queryKey: MPVI_TECNICOS_QUERY_KEYS.stock(cod),
    queryFn: () => mpviTecnicosService.obtenerStock({ codRepuesto: cod }),
    enabled: cod.length > 0,
    staleTime: 60 * 1000,
  });

  return { stock: data, loading: isLoading };
}

export function useMpviTecnicosActions() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const empresa = user?.empresa;

  const guardar = useMutation({
    mutationFn: (payload: MpviGuardarTecnicoPayload) =>
      mpviTecnicosService.guardarDatos(payload),
    onSuccess: (result) => {
      if (!result.ok) {
        showError("Hubo un error al guardar la cotización");
        return;
      }
      showSuccess("Cotización guardada correctamente");
    },
    onError: (err: Error) => showError(err.message),
  });

  const consultarStock = useMutation({
    mutationFn: (codRepuesto: string) =>
      mpviTecnicosService.obtenerStock({ codRepuesto }),
  });

  return {
    guardar,
    consultarStock,
    abrirPdf: (idCotizacion: number) =>
      mpviTecnicosService.abrirPdf(idCotizacion, empresa),
  };
}
