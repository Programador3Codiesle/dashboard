"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { INFORME_OT_ABIERTAS_SUBMENU_ID } from "@/utils/constants";
import { useTallerPageGuard } from "@/modules/taller/shared/hooks/useTallerPageGuard";
import { TallerPageFrame } from "@/modules/taller/components/TallerPageFrame";
import { TALLER_COPY } from "@/modules/taller/constants";
import { IOA_CARD } from "../utils/informe-ot-abiertas.styles";
import { BodegasSummaryCards } from "./BodegasSummaryCards";
import { InformeOtAbiertasTable } from "./InformeOtAbiertasTable";
import {
  InformeOtAbiertasLoading,
  InformeOtAbiertasLoadingOverlay,
} from "./InformeOtAbiertasLoading";
import { useInformeOtAbiertasPorSede } from "../hooks/useInformeOtAbiertas";
import { isSedeKey } from "../types/informe-ot-abiertas.types";

export function InformeOtAbiertasSedeGestion() {
  const { blocked } = useTallerPageGuard(INFORME_OT_ABIERTAS_SUBMENU_ID);
  const router = useRouter();
  const params = useParams();
  const sedeParam = typeof params.sede === "string" ? params.sede : "";
  const sedeValida = isSedeKey(sedeParam);

  useEffect(() => {
    if (sedeParam && !isSedeKey(sedeParam)) {
      router.replace("/dashboard/taller/informe-ordenes-abiertas");
    }
  }, [sedeParam, router]);

  const [busqueda, setBusqueda] = useState("");
  const { data, loading, error } = useInformeOtAbiertasPorSede(
    sedeValida ? sedeParam : "",
    sedeValida && !blocked,
  );

  const handleBusqueda = useCallback((value: string) => {
    setBusqueda(value);
  }, []);

  if (blocked || !sedeValida) return null;

  return (
    <TallerPageFrame
      title={TALLER_COPY.informeOtAbiertasSede.title}
      description={TALLER_COPY.informeOtAbiertasSede.description}
    >
      {loading && !data ? (
        <div className={IOA_CARD}>
          <InformeOtAbiertasLoading message="Cargando informe por sede..." />
        </div>
      ) : (
      <div className="space-y-4">
        <Link
          href="/dashboard/taller/informe-ordenes-abiertas"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al informe general
        </Link>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {data?.sedeLabel && (
          <p className="text-sm text-gray-600">
            Sede:{" "}
            <span className="font-semibold text-gray-900">{data.sedeLabel}</span>
          </p>
        )}

        <BodegasSummaryCards totales={data?.totalesBodegas ?? []} />

        <div className={`${IOA_CARD} p-4`}>
          <SearchFilter
            onSearch={handleBusqueda}
            placeholder="Buscar en la tabla..."
            className="max-w-md"
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
