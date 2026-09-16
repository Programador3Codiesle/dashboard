"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogQueryOptions } from "@/core/query/catalog-query-options";
import { informesKeys } from "@/modules/informes/shared/constants/query-keys";
import { listarEmpleadosInformesCombo } from "@/modules/informes/shared/services/empleados-combo.service";

export function useEmpleadosInformesCombo() {
  return useQuery({
    queryKey: informesKeys.empleadosCombo,
    queryFn: listarEmpleadosInformesCombo,
    ...catalogQueryOptions,
  });
}
