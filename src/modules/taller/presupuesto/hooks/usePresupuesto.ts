import { useMutation, useQuery } from "@tanstack/react-query";
import { presupuestoService } from "../services/presupuesto.service";
import { catalogQueryOptions } from "@/core/query/catalog-query-options";
import type {
  ActualizarPresupuestoParams,
  ConsultarPresupuestoParams,
} from "../types";

const CATALOGOS_KEY = ["presupuesto", "catalogos"] as const;

export function useCatalogosPresupuesto() {
  return useQuery({
    queryKey: CATALOGOS_KEY,
    queryFn: () => presupuestoService.obtenerCatalogos(),
    ...catalogQueryOptions,
  });
}

export function useConsultarPresupuesto() {
  return useMutation({
    mutationFn: (params: ConsultarPresupuestoParams) =>
      presupuestoService.consultar(params),
  });
}

export function useActualizarPresupuesto() {
  return useMutation({
    mutationFn: (params: ActualizarPresupuestoParams) =>
      presupuestoService.actualizar(params),
  });
}
