import { useQuery } from "@tanstack/react-query";
import {
  cotizadorLivianosService,
  CotizacionRevisionDetalle,
  LivianosInitData,
  RevisionOption,
  VehiculoCotizacionLivianos,
} from "../services/cotizador-livianos.service";
import { useAuth } from "@/core/auth/hooks/useAuth";

export const COTIZADOR_LIVIANOS_QUERY_KEYS = {
  init: ["cotizador", "livianos", "init"] as const,
  vehiculo: (placa: string, empresaKey: string) =>
    ["cotizador", "livianos", "vehiculo", placa, empresaKey] as const,
  revisiones: (clase: string) => ["cotizador", "livianos", "revisiones", clase] as const,
  detalle: (bodega: number, clase: string, revision: number) =>
    ["cotizador", "livianos", "detalle", bodega, clase, revision] as const,
};

export function useCotizadorLivianosInit() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<LivianosInitData>({
    queryKey: COTIZADOR_LIVIANOS_QUERY_KEYS.init,
    queryFn: () => cotizadorLivianosService.getInitData(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    data,
    loading: isLoading,
    error: error ? "No se pudo cargar la configuración inicial." : null,
    refetch,
  };
}

export function useVehiculoPorPlaca(placa: string | null) {
  const { user } = useAuth();
  const empresaId = user?.empresa;
  const empresaKey = empresaId != null ? String(empresaId) : "sin-empresa";

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<VehiculoCotizacionLivianos>({
    // react-query v5 no admite queryKey undefined; usamos una clave constante y enabled
    queryKey: COTIZADOR_LIVIANOS_QUERY_KEYS.vehiculo(placa || "", empresaKey),
    queryFn: () =>
      cotizadorLivianosService.getVehiculoPorPlaca(
        placa || "",
        empresaId != null ? String(empresaId) : undefined,
      ),
    enabled: !!placa,
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  let errorMessage: string | null = null;
  if (error) {
    if (error instanceof Error && error.message) {
      errorMessage = error.message;
    } else {
      errorMessage = "No se pudo obtener la información del vehículo.";
    }
  }

  return {
    vehiculo: data,
    loading: isLoading,
    error: errorMessage,
    refetch,
  };
}

export function useRevisionesLivianos(clase: string | null) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<RevisionOption[]>({
    queryKey: COTIZADOR_LIVIANOS_QUERY_KEYS.revisiones(clase || ""),
    queryFn: () => cotizadorLivianosService.getRevisiones(clase || ""),
    enabled: !!clase,
    staleTime: 5 * 60 * 1000,
  });

  return {
    revisiones: data || [],
    loading: isLoading,
    error: error ? "No se pudieron cargar las revisiones." : null,
    refetch,
  };
}

export function useRevisionDetalleLivianos(params: {
  bodega: number | null;
  clase: string | null;
  revision: number | null;
  kmClienteValido: boolean;
  yearModel: number | null;
}) {
  const enabled =
    !!params.bodega &&
    !!params.clase &&
    !!params.revision &&
    params.kmClienteValido === true &&
    params.yearModel != null;

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<CotizacionRevisionDetalle>({
    queryKey: COTIZADOR_LIVIANOS_QUERY_KEYS.detalle(
      (params.bodega ?? 0) as number,
      (params.clase ?? "") as string,
      (params.revision ?? 0) as number,
    ),
    queryFn: () =>
      cotizadorLivianosService.getRevisionDetalle({
        bodega: params.bodega as number,
        clase: params.clase as string,
        revision: params.revision as number,
        yearModel: params.yearModel as number,
      }),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  return {
    detalle: data,
    loading: isLoading,
    error: error ? "No se pudo cargar el detalle de la cotización." : null,
    refetch,
  };
}

