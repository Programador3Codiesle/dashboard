import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { posiblesRetornosService } from "../services/posibles-retornos.service";
import { catalogQueryOptions } from "@/core/query/catalog-query-options";
import type {
  GuardarDefinicionParams,
  ListarParams,
} from "../types";

const CATALOGOS_KEY = ["posibles-retornos", "catalogos"] as const;
const LISTAR_KEY = "posibles-retornos-listar";

export function useCatalogosPosiblesRetornos() {
  return useQuery({
    queryKey: CATALOGOS_KEY,
    queryFn: () => posiblesRetornosService.obtenerCatalogos(),
    ...catalogQueryOptions,
  });
}

export function useListarPosiblesRetornos(params: ListarParams, enabled = true) {
  return useQuery({
    queryKey: [LISTAR_KEY, params],
    queryFn: () => posiblesRetornosService.listar(params),
    enabled,
  });
}

export function useDetallePosibleRetorno() {
  return useMutation({
    mutationFn: (placa: string) => posiblesRetornosService.obtenerDetalle(placa),
  });
}

export function useGuardarDefinicionRetorno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: GuardarDefinicionParams) =>
      posiblesRetornosService.guardarDefinicion(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTAR_KEY] });
    },
  });
}

export function useSolucionPosibleRetorno() {
  return useMutation({
    mutationFn: (numero: number) => posiblesRetornosService.obtenerSolucion(numero),
  });
}

export function useCerrarBdcPosibleRetorno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idPosibleBdc: number) =>
      posiblesRetornosService.cerrarBdc(idPosibleBdc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LISTAR_KEY] });
    },
  });
}
