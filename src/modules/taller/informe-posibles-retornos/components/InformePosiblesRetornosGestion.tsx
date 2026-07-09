"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  useInformePosiblesRetornosCatalogos,
  useInformePosiblesRetornosGrafico,
} from "../hooks/useInformePosiblesRetornos";
import type {
  GetGraficoParams,
  GraficoChartPoint,
  GraficoSuccessResponse,
} from "../types";
import { FiltrosInforme } from "./FiltrosInforme";
import { GraficoEntradasRetornos } from "./GraficoEntradasRetornos";

function toChartData(response: GraficoSuccessResponse): GraficoChartPoint[] {
  return response.entradas.map((point, index) => ({
    mes: point.label,
    entradas: point.y,
    retornos: response.retornos[index]?.y ?? 0,
    posibles: response.posibles[index]?.y ?? 0,
  }));
}

export function InformePosiblesRetornosGestion() {
  const { showError } = useToast();
  const currentYear = new Date().getFullYear();

  const [yearInput, setYearInput] = useState(currentYear);
  const [tecnicoInput, setTecnicoInput] = useState("");
  const [sedeInput, setSedeInput] = useState("");

  const [queryParams, setQueryParams] = useState<GetGraficoParams>({
    year: currentYear,
  });

  const { catalogos, loadingCatalogos } = useInformePosiblesRetornosCatalogos();
  const { grafico, loading, error } = useInformePosiblesRetornosGrafico(queryParams);

  const chartData = useMemo(() => {
    if (grafico?.response === "success") {
      return toChartData(grafico);
    }
    return [];
  }, [grafico]);

  useEffect(() => {
    if (grafico?.response === "error") {
      showError("No se ha encontrado información.");
    }
  }, [grafico, showError]);

  useEffect(() => {
    if (error) {
      showError(
        "Ha ocurrido un error al realizar la petición. Intente nuevamente.",
      );
    }
  }, [error, showError]);

  const handleGenerar = useCallback(() => {
    if (!yearInput) return;

    setQueryParams({
      year: yearInput,
      tecnico: tecnicoInput || undefined,
      sede: sedeInput ? Number(sedeInput) : undefined,
    });
  }, [yearInput, tecnicoInput, sedeInput]);

  const handleTecnicoChange = (nit: string) => {
    setTecnicoInput(nit);
    if (nit) setSedeInput("");
  };

  const handleSedeChange = (bodega: string) => {
    setSedeInput(bodega);
    if (bodega) setTecnicoInput("");
  };

  const handleTecnicoFocus = () => {
    setSedeInput("");
  };

  const handleSedeFocus = () => {
    setTecnicoInput("");
  };

  const isLoading = loadingCatalogos || loading;

  return (
    <div className="space-y-4">
      <FiltrosInforme
        year={yearInput}
        tecnico={tecnicoInput}
        sede={sedeInput}
        tecnicos={catalogos?.tecnicos ?? []}
        bodegas={catalogos?.bodegas ?? []}
        onYearChange={setYearInput}
        onTecnicoChange={handleTecnicoChange}
        onSedeChange={handleSedeChange}
        onTecnicoFocus={handleTecnicoFocus}
        onSedeFocus={handleSedeFocus}
        onGenerar={handleGenerar}
        loading={isLoading}
      />

      <div className="relative bg-white brand-card-elevated rounded-2xl border brand-border-active p-4 sm:p-6 min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Loader2 className="w-5 h-5 animate-spin" />
              Cargando informe...
            </div>
          </div>
        )}

        {chartData.length > 0 ? (
          <div>
            <h3 className="text-center text-lg font-semibold text-gray-800 mb-4">
              Entradas Vs. Retornos
            </h3>
            <GraficoEntradasRetornos data={chartData} />
          </div>
        ) : (
          !isLoading && (
            <div className="flex items-center justify-center h-[370px] text-gray-400 text-sm">
              Seleccione los filtros y presione GENERAR para ver el gráfico
            </div>
          )
        )}
      </div>
    </div>
  );
}
