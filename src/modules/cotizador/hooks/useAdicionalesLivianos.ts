import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AdicionalesLivianosInitResponse,
  BulkManoObraAdicionalLivianoInput,
  BulkRepuestoAdicionalLivianoInput,
  BulkResultAdicionalLiviano,
  CodigoRepuestoValidationResponse,
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

export function useUpdateEstadoAdicionalLiviano() {
  const client = useQueryClient();

  return useMutation<void, Error, { id: number; estado: number }>({
    mutationFn: ({ id, estado }) =>
      cotizadorAdicionalesLivianosService.updateAdicionalEstado(id, estado),
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

export function useValidarCodigoRepuesto() {
  return useMutation<
    CodigoRepuestoValidationResponse,
    Error,
    { codigo: string }
  >({
    mutationFn: ({ codigo }) =>
      cotizadorAdicionalesLivianosService.validarCodigoRepuesto(codigo),
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

export function useUpdateRepuestoAdicionalLiviano() {
  const client = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      seq: number;
      descripcion: string;
      cantidad: number;
      yearStart: number;
      yearEnd: number;
      descuento?: number | null;
    }
  >({
    mutationFn: (payload) =>
      cotizadorAdicionalesLivianosService.updateRepuestoAdicional(payload),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ADICIONALES_LIVIANOS_KEYS.lista(undefined, "all"),
      });
    },
  });
}

export function useUpdateManoObraAdicionalLiviano() {
  const client = useQueryClient();

  return useMutation<
    void,
    Error,
    {
      id: number;
      operacion: string;
      tiempo: number;
      valorMenos5: number;
      valorMas5: number;
      descuento?: number | null;
    }
  >({
    mutationFn: (payload) =>
      cotizadorAdicionalesLivianosService.updateManoObraAdicional(payload),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ADICIONALES_LIVIANOS_KEYS.lista(undefined, "all"),
      });
    },
  });
}

export function useDeleteRepuestoAdicionalLiviano() {
  const client = useQueryClient();

  return useMutation<
    void,
    Error,
    { seq: number; codigo: string; adicionalId: number }
  >({
    mutationFn: (payload) =>
      cotizadorAdicionalesLivianosService.deleteRepuestoAdicional(payload),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ADICIONALES_LIVIANOS_KEYS.lista(undefined, "all"),
      });
    },
  });
}

export function useDeleteManoObraAdicionalLiviano() {
  const client = useQueryClient();

  return useMutation<
    void,
    Error,
    { id: number; operacion: string; adicionalId: number }
  >({
    mutationFn: (payload) =>
      cotizadorAdicionalesLivianosService.deleteManoObraAdicional(payload),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ADICIONALES_LIVIANOS_KEYS.lista(undefined, "all"),
      });
    },
  });
}

