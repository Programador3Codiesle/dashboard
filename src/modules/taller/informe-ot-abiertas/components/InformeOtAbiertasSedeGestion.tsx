"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { IOA_CARD } from "../utils/informe-ot-abiertas.styles";
import { BodegasSummaryCards } from "./BodegasSummaryCards";
import { InformeOtAbiertasTable } from "./InformeOtAbiertasTable";
import {
  InformeOtAbiertasLoading,
  InformeOtAbiertasLoadingOverlay,
} from "./InformeOtAbiertasLoading";
import { useInformeOtAbiertasPorSede } from "../hooks/useInformeOtAbiertas";

interface InformeOtAbiertasSedeGestionProps {
  sede: string;
}

export function InformeOtAbiertasSedeGestion({
  sede,
}: InformeOtAbiertasSedeGestionProps) {
  const [busqueda, setBusqueda] = useState("");
  const { data, loading, error } = useInformeOtAbiertasPorSede(sede);

  const handleBusqueda = useCallback((value: string) => {
    setBusqueda(value);
  }, []);

  if (loading && !data) {
    return (
      <div className={IOA_CARD}>
        <InformeOtAbiertasLoading message="Cargando informe por sede..." />
      </div>
    );
  }

  return (
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
          Sede: <span className="font-semibold text-gray-900">{data.sedeLabel}</span>
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
  );
}
