"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogQueryOptions } from "@/core/query/catalog-query-options";
import { administracionKeys } from "@/modules/administracion/shared/constants/query-keys";
import { gestionComprasService } from "@/modules/administracion/services/gestion-compras.service";

export function useUsuariosGerenteCompra(enabled: boolean) {
  return useQuery({
    queryKey: administracionKeys.gestionComprasUsuariosGerente,
    queryFn: () => gestionComprasService.listarUsuariosGerente(),
    enabled,
    ...catalogQueryOptions,
  });
}
