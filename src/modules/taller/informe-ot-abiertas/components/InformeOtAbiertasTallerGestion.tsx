"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { IOA_CARD } from "../utils/informe-ot-abiertas.styles";
import { AsesoresOtTable } from "./AsesoresOtTable";
import {
  InformeOtAbiertasLoading,
  InformeOtAbiertasLoadingOverlay,
} from "./InformeOtAbiertasLoading";
import { useInformeOtAbiertasPorTaller } from "../hooks/useInformeOtAbiertas";

interface InformeOtAbiertasTallerGestionProps {
  bodegaId: number;
}

export function InformeOtAbiertasTallerGestion({
  bodegaId,
}: InformeOtAbiertasTallerGestionProps) {
  const [busqueda, setBusqueda] = useState("");
  const { data, loading, error } = useInformeOtAbiertasPorTaller(bodegaId);

  const handleBusqueda = useCallback((value: string) => {
    setBusqueda(value);
  }, []);

  if (loading && !data) {
    return (
      <div className={IOA_CARD}>
        <InformeOtAbiertasLoading message="Cargando informe por taller..." />
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
  );
}
