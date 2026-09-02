"use client";

import { useCallback, useState } from "react";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { INFORME_OT_ABIERTAS_SUBMENU_ID } from "@/utils/constants";
import { useTallerPageGuard } from "@/modules/taller/shared/hooks/useTallerPageGuard";
import { TallerPageFrame } from "@/modules/taller/components/TallerPageFrame";
import { TALLER_COPY } from "@/modules/taller/constants";
import { IOA_CARD } from "../utils/informe-ot-abiertas.styles";
import { InformeOtAbiertasTable } from "./InformeOtAbiertasTable";
import { SedesSummaryCards } from "./SedesSummaryCards";
import {
  InformeOtAbiertasLoading,
  InformeOtAbiertasLoadingOverlay,
} from "./InformeOtAbiertasLoading";
import { useInformeOtAbiertasGeneral } from "../hooks/useInformeOtAbiertas";

export function InformeOtAbiertasGeneralGestion() {
  const { blocked } = useTallerPageGuard(INFORME_OT_ABIERTAS_SUBMENU_ID);
  const [busqueda, setBusqueda] = useState("");
  const { data, loading, error } = useInformeOtAbiertasGeneral();

  const handleBusqueda = useCallback((value: string) => {
    setBusqueda(value);
  }, []);

  if (blocked) return null;

  return (
    <TallerPageFrame
      title={TALLER_COPY.informeOtAbiertas.title}
      description={TALLER_COPY.informeOtAbiertas.description}
    >
      {loading && !data ? (
        <div className={IOA_CARD}>
          <InformeOtAbiertasLoading message="Cargando informe de órdenes abiertas..." />
        </div>
      ) : (
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
      )}
    </TallerPageFrame>
  );
}
