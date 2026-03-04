import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdicionalesLivianosInitResponse,
  BulkManoObraAdicionalLivianoInput,
  BulkRepuestoAdicionalLivianoInput,
  BulkResultAdicionalLiviano,
  ListarAdicionalesLivianosResponse,
  cotizadorAdicionalesLivianosService,
} from "../services/cotizador-adicionales-livianos.service";

export const ADICIONALES_LIVIANOS_KEYS = {
  init: ["cotizador", "adicionales-livianos", "init"] as const,
  lista: (adicionalId?: number, clasesKey?: string) =>
    ["cotizador", "adicionales-livianos", "lista", adicionalId ?? "all", clasesKey ?? "all"] as const,
};

export function useAdicionalesLivianosInit() {
  const { data, isLoading, error, refetch } =
    useQuery<AdicionalesLivianosInitResponse>({
      queryKey: ADICIONALES_LIVIANOS_KEYS.init,
      queryFn: () => cotizadorAdicionalesLivianosService.getInit(),
      staleTime: 5 * 60 * 1000,
    });

  return {
    data,
    loading: isLoading,
    error: error ? "No se pudo cargar la configuración de adicionales." : null,
    refetch,
  };
}

export function useCrearAdicionalLiviano() {
  const client = useQueryClient();

  return useMutation<void, Error, { nombre: string }>({
    mutationFn: ({ nombre }) =>
      cotizadorAdicionalesLivianosService.crearAdicional(nombre),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ADICIONALES_LIVIANOS_KEYS.init });
    },
  });
}

export function useCargarAdicionalLiviano() {
  return useMutation<
    BulkResultAdicionalLiviano,
    Error,
    {
      adicionalId: number;
      clases: string[];
      repuestos: BulkRepuestoAdicionalLivianoInput[];
      manoObra: BulkManoObraAdicionalLivianoInput[];
    }
  >({
    mutationFn: (payload) =>
      cotizadorAdicionalesLivianosService.cargarItems(payload),
  });
}

export function useListarAdicionalesLivianos(params: {
  adicionalId?: number;
  clases?: string[];
}) {
  const clasesKey =
    params.clases && params.clases.length ? params.clases.join(",") : "all";

  const { data, isLoading, error, refetch } =
    useQuery<ListarAdicionalesLivianosResponse>({
      queryKey: ADICIONALES_LIVIANOS_KEYS.lista(
        params.adicionalId,
        clasesKey
      ),
      queryFn: () => cotizadorAdicionalesLivianosService.listar(params),
      enabled: !!params.adicionalId || !!(params.clases && params.clases.length),
      staleTime: 2 * 60 * 1000,
    });

  return {
    data,
    loading: isLoading,
    error: error ? "No se pudo listar los adicionales." : null,
    refetch,
  };
}

