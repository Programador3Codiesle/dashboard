"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import { useGenerarPygAsesoresRepuestos } from "../hooks/usePygAsesoresRepuestos";
import type { FiltrosPygState } from "../types";
import { exportPygAsesoresExcel } from "../utils/export-excel";
import { FiltrosPygAsesores } from "./FiltrosPygAsesores";
import { TablaPygAsesores } from "./TablaPygAsesores";

const EMPTY_FILTROS: FiltrosPygState = {
  yearOne: "",
  monthOne: "",
  monthTwo: "",
  yearTwo: "",
};

export function PygAsesoresRepuestosGestion() {
  const { showError } = useToast();
  const [filtros, setFiltros] = useState<FiltrosPygState>(EMPTY_FILTROS);
  const [searchTerm, setSearchTerm] = useState("");
  const { generar, data, loading, reset } = useGenerarPygAsesoresRepuestos();

  const handleFiltrosChange = useCallback(
    (next: FiltrosPygState) => {
      if (next.yearOne && next.yearTwo && Number(next.yearTwo) >= Number(next.yearOne)) {
        showError("Debe seleccionar un año a comparar menor al año del informe");
        setFiltros({ ...next, yearTwo: "" });
        return;
      }

      if (next.monthOne && next.monthTwo && next.monthOne > next.monthTwo) {
        showError("El mes DESDE debe ser menor o igual que el mes HASTA");
        return;
      }

      setFiltros(next);
    },
    [showError],
  );

  const handleGenerar = async () => {
    const { yearOne, monthOne, monthTwo, yearTwo } = filtros;

    if (!yearOne || !monthOne || !monthTwo || !yearTwo) {
      showError("Por favor verifique que haya diligenciado todos los campos");
      return;
    }

    if (Number(yearTwo) >= Number(yearOne)) {
      showError("Debe seleccionar un año a comparar menor al año del informe");
      return;
    }

    if (monthOne > monthTwo) {
      showError("El mes DESDE debe ser menor o igual que el mes HASTA");
      return;
    }

    try {
      reset();
      setSearchTerm("");
      await generar({
        yearOne: Number(yearOne),
        monthOne,
        monthTwo,
        yearTwo: Number(yearTwo),
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "No se encontraron datos";
      showError(msg);
    }
  };

  const handleExportExcel = () => {
    if (!data?.filas?.length) {
      showError("No hay datos para exportar");
      return;
    }
    exportPygAsesoresExcel(data.filas, data.yearComparar);
  };

  return (
    <div className="space-y-4">
      <FiltrosPygAsesores
        filtros={filtros}
        onChange={handleFiltrosChange}
        onGenerar={handleGenerar}
        onExportExcel={handleExportExcel}
        loading={loading}
        canExport={!!data?.filas?.length}
      />

      <div className="relative bg-white brand-card-elevated rounded-2xl border brand-border-active p-4 sm:p-6">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando informe...
            </div>
          </div>
        )}

        {data?.filas?.length ? (
          <>
            <div className="mb-4">
              <SearchFilter
                onSearch={setSearchTerm}
                placeholder="Buscar asesor..."
                className="max-w-sm"
              />
            </div>
            <TablaPygAsesores
              filas={data.filas}
              yearComparar={data.yearComparar}
              searchTerm={searchTerm}
            />
          </>
        ) : (
          !loading && (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              Complete los filtros y presione GENERAR para ver el informe
            </div>
          )
        )}
      </div>
    </div>
  );
}
