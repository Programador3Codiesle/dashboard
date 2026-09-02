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
import { AsesoresOtTable } from "./AsesoresOtTable";
import {
  InformeOtAbiertasLoading,
  InformeOtAbiertasLoadingOverlay,
} from "./InformeOtAbiertasLoading";
import { useInformeOtAbiertasPorTaller } from "../hooks/useInformeOtAbiertas";

export function InformeOtAbiertasTallerGestion() {
  const { blocked } = useTallerPageGuard(INFORME_OT_ABIERTAS_SUBMENU_ID);
  const router = useRouter();
  const params = useParams();
  const bodegaParam = typeof params.bodegaId === "string" ? params.bodegaId : "";
  const bodegaId = Number(bodegaParam);
  const bodegaValida =
    !!bodegaParam && Number.isFinite(bodegaId) && bodegaId > 0;

  useEffect(() => {
    if (bodegaParam && (!Number.isFinite(bodegaId) || bodegaId <= 0)) {
      router.replace("/dashboard/taller/informe-ordenes-abiertas");
    }
  }, [bodegaParam, bodegaId, router]);

  const [busqueda, setBusqueda] = useState("");
  const { data, loading, error } = useInformeOtAbiertasPorTaller(
    bodegaValida ? bodegaId : 0,
    bodegaValida && !blocked,
  );

  const handleBusqueda = useCallback((value: string) => {
    setBusqueda(value);
  }, []);

  if (blocked || !bodegaValida) return null;

  return (
    <TallerPageFrame
      title={TALLER_COPY.informeOtAbiertasTaller.title}
      description={TALLER_COPY.informeOtAbiertasTaller.description}
    >
      {loading && !data ? (
        <div className={IOA_CARD}>
          <InformeOtAbiertasLoading message="Cargando informe por taller..." />
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

        <p className="text-sm text-gray-600">
          Bodega: <span className="font-semibold text-gray-900">{bodegaId}</span>
        </p>

        <div className={`${IOA_CARD} p-4`}>
          <SearchFilter
            onSearch={handleBusqueda}
            placeholder="Buscar asesor..."
            className="max-w-md"
          />
        </div>

        <div className={`${IOA_CARD} p-0 overflow-hidden relative`}>
          {loading && data && (
            <InformeOtAbiertasLoadingOverlay message="Actualizando..." />
          )}
          <AsesoresOtTable asesores={data?.asesores ?? []} busqueda={busqueda} />
        </div>
      </div>
      )}
    </TallerPageFrame>
  );
}
