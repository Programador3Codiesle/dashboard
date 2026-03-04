import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdicionalesPesadosInitResponse,
  BulkManoObraAdicionalPesadoInput,
  BulkRepuestoAdicionalPesadoInput,
  BulkResultAdicionalPesado,
  ListarAdicionalesPesadosResponse,
  cotizadorAdicionalesPesadosService,
} from "../services/cotizador-adicionales-pesados.service";

export const ADICIONALES_PESADOS_KEYS = {
  init: ["cotizador", "adicionales-pesados", "init"] as const,
  lista: (adicionalId?: number, clasesKey?: string) =>
    ["cotizador", "adicionales-pesados", "lista", adicionalId ?? "all", clasesKey ?? "all"] as const,
};

export function useAdicionalesPesadosInit() {
  const { data, isLoading, error, refetch } =
    useQuery<AdicionalesPesadosInitResponse>({
      queryKey: ADICIONALES_PESADOS_KEYS.init,
      queryFn: () => cotizadorAdicionalesPesadosService.getInit(),
      staleTime: 5 * 60 * 1000,
    });

  return {
    data,
    loading: isLoading,
    error: error ? "No se pudo cargar la configuración de adicionales." : null,
    refetch,
  };
}

export function useCrearAdicionalPesado() {
  const client = useQueryClient();

  return useMutation<void, Error, { nombre: string }>({
    mutationFn: ({ nombre }) =>
      cotizadorAdicionalesPesadosService.crearAdicional(nombre),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ADICIONALES_PESADOS_KEYS.init });
    },
  });
}

export function useCargarAdicionalPesado() {
  return useMutation<
    BulkResultAdicionalPesado,
    Error,
    {
      adicionalId: number;
      clases: string[];
      repuestos: BulkRepuestoAdicionalPesadoInput[];
      manoObra: BulkManoObraAdicionalPesadoInput[];
    }
  >({
    mutationFn: (payload) =>
      cotizadorAdicionalesPesadosService.cargarItems(payload),
  });
}

export function useListarAdicionalesPesados(params: {
  adicionalId?: number;
  clases?: string[];
}) {
  const clasesKey =
    params.clases && params.clases.length ? params.clases.join(",") : "all";

  const { data, isLoading, error, refetch } =
    useQuery<ListarAdicionalesPesadosResponse>({
      queryKey: ADICIONALES_PESADOS_KEYS.lista(
        params.adicionalId,
        clasesKey
      ),
      queryFn: () => cotizadorAdicionalesPesadosService.listar(params),
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

