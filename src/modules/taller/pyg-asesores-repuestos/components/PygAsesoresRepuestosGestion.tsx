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
import { PYG_ASESORES_REPUESTOS_SUBMENU_ID } from "@/utils/constants";
import { useTallerPageGuard } from "@/modules/taller/shared/hooks/useTallerPageGuard";
import { TallerPageFrame } from "@/modules/taller/components/TallerPageFrame";
import { TALLER_COPY } from "@/modules/taller/constants";
import { getErrorMessage } from "@/modules/taller/shared/utils/get-error-message";
import {
  evaluatePygFiltrosChange,
  pygFiltrosGenerarError,
} from "@/modules/taller/shared/utils/pyg-filtros";

const EMPTY_FILTROS: FiltrosPygState = {
  yearOne: "",
  monthOne: "",
  monthTwo: "",
  yearTwo: "",
};

export function PygAsesoresRepuestosGestion() {
  const { blocked } = useTallerPageGuard(PYG_ASESORES_REPUESTOS_SUBMENU_ID);
  const { showError } = useToast();
  const [filtros, setFiltros] = useState<FiltrosPygState>(EMPTY_FILTROS);
  const [searchTerm, setSearchTerm] = useState("");
  const { generar, data, loading, reset } = useGenerarPygAsesoresRepuestos();

  const handleFiltrosChange = useCallback(
    (next: FiltrosPygState) => {
      const result = evaluatePygFiltrosChange(next);
      if (!result.ok) {
        showError(result.message);
        if (result.clearYearTwo) {
          setFiltros({ ...next, yearTwo: "" });
        }
        return;
      }
      setFiltros(next);
    },
    [showError],
  );

  const handleGenerar = async () => {
    const generarError = pygFiltrosGenerarError(filtros);
    if (generarError) {
      showError(generarError);
      return;
    }

    const { yearOne, monthOne, monthTwo, yearTwo } = filtros;

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
      showError(getErrorMessage(err, "No se encontraron datos"));
    }
  };

  const handleExportExcel = async () => {
    if (!data?.filas?.length) {
      showError("No hay datos para exportar");
      return;
    }
    await exportPygAsesoresExcel(data.filas, data.yearComparar);
  };

  if (blocked) return null;

  return (
    <TallerPageFrame
      title={TALLER_COPY.pygAsesores.title}
      description={TALLER_COPY.pygAsesores.description}
    >
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
    </TallerPageFrame>
  );
}
