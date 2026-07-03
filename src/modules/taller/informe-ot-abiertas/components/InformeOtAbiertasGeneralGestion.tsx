"use client";

import { useCallback, useState } from "react";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { IOA_CARD } from "../utils/informe-ot-abiertas.styles";
import { InformeOtAbiertasTable } from "./InformeOtAbiertasTable";
import { SedesSummaryCards } from "./SedesSummaryCards";
import {
  InformeOtAbiertasLoading,
  InformeOtAbiertasLoadingOverlay,
} from "./InformeOtAbiertasLoading";
import { useInformeOtAbiertasGeneral } from "../hooks/useInformeOtAbiertas";

export function InformeOtAbiertasGeneralGestion() {
  const [busqueda, setBusqueda] = useState("");
  const { data, loading, error } = useInformeOtAbiertasGeneral();

  const handleBusqueda = useCallback((value: string) => {
    setBusqueda(value);
  }, []);

  if (loading && !data) {
    return (
      <div className={IOA_CARD}>
        <InformeOtAbiertasLoading message="Cargando informe de órdenes abiertas..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <SedesSummaryCards totales={data?.totalesSedes ?? []} />

      <div className={`${IOA_CARD} p-4`}>
        <SearchFilter
          onSearch={handleBusqueda}
          placeholder="Buscar en la tabla..."
          className="max-w-md mb-4"
        />
      </div>

      <div className={`${IOA_CARD} p-0 overflow-hidden relative`}>
        {loading && data && (
          <InformeOtAbiertasLoadingOverlay message="Actualizando órdenes..." />
        )}
        <InformeOtAbiertasTable
          ordenes={data?.ordenes ?? []}
          busqueda={busqueda}
        />
      </div>
    </div>
  );
}
