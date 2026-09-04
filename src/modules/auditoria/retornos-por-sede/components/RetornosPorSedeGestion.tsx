'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AuditoriaPageFrame } from '@/modules/auditoria/components/AuditoriaPageFrame';
import { AUDITORIA_COPY } from '@/modules/auditoria/constants';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { FiltrosInforme } from '@/modules/taller/informe-posibles-retornos/components/FiltrosInforme';
import { GraficoEntradasRetornos } from '@/modules/taller/informe-posibles-retornos/components/GraficoEntradasRetornos';
import {
  useInformePosiblesRetornosCatalogos,
  useInformePosiblesRetornosGrafico,
} from '@/modules/taller/informe-posibles-retornos/hooks/useInformePosiblesRetornos';
import type {
  GetGraficoParams,
  GraficoChartPoint,
  GraficoSuccessResponse,
} from '@/modules/taller/informe-posibles-retornos/types';
import { RETORNOS_POR_SEDE_SUBMENU_ID } from '@/utils/constants';

function toChartData(response: GraficoSuccessResponse): GraficoChartPoint[] {
  return response.entradas.map((point, index) => ({
    mes: point.label,
    entradas: point.y,
    retornos: response.retornos[index]?.y ?? 0,
    posibles: response.posibles[index]?.y ?? 0,
  }));
}

export function RetornosPorSedeGestion() {
  const { blocked } = useAuditoriaPageGuard(RETORNOS_POR_SEDE_SUBMENU_ID);
  const { showError } = useToast();
  const currentYear = new Date().getFullYear();

  const [yearInput, setYearInput] = useState(currentYear);
  const [tecnicoInput, setTecnicoInput] = useState('');
  const [sedeInput, setSedeInput] = useState('');
  const [queryParams, setQueryParams] = useState<GetGraficoParams>({
    year: currentYear,
  });

  const { catalogos, loadingCatalogos } = useInformePosiblesRetornosCatalogos();
  const { grafico, loading, error } =
    useInformePosiblesRetornosGrafico(queryParams);

  const chartData = useMemo(() => {
    if (grafico?.response === 'success') {
      return toChartData(grafico);
    }
    return [];
  }, [grafico]);

  useEffect(() => {
    if (grafico?.response === 'error') {
      showError('No se ha encontrado información.');
    }
  }, [grafico, showError]);

  useEffect(() => {
    if (error) {
      showError(
        'Ha ocurrido un error al realizar la petición. Intente nuevamente.',
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

  const isLoading = loadingCatalogos || loading;

  if (blocked) return null;

  return (
    <AuditoriaPageFrame
      title={AUDITORIA_COPY.retornos.title}
      description={AUDITORIA_COPY.retornos.description}
      backLabel={AUDITORIA_COPY.backLabel}
    >
      <div className="space-y-4">
        <FiltrosInforme
          year={yearInput}
          tecnico={tecnicoInput}
          sede={sedeInput}
          tecnicos={catalogos?.tecnicos ?? []}
          bodegas={catalogos?.bodegas ?? []}
          onYearChange={setYearInput}
          onTecnicoChange={(nit) => {
            setTecnicoInput(nit);
            if (nit) setSedeInput('');
          }}
          onSedeChange={(bodega) => {
            setSedeInput(bodega);
            if (bodega) setTecnicoInput('');
          }}
          onTecnicoFocus={() => setSedeInput('')}
          onSedeFocus={() => setTecnicoInput('')}
          onGenerar={handleGenerar}
          loading={isLoading}
        />

        <div className="app-section-card relative min-h-[280px] w-full min-w-0 overflow-hidden sm:min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando informe...
              </div>
            </div>
          ) : null}

          {chartData.length > 0 ? (
            <div className="min-w-0 overflow-x-auto">
              <h3 className="mb-4 text-center text-lg font-semibold text-gray-800">
                Entradas Vs. Retornos
              </h3>
              <GraficoEntradasRetornos data={chartData} />
            </div>
          ) : (
            !isLoading && (
              <div className="flex h-[370px] items-center justify-center text-sm text-gray-400">
                Seleccione los filtros y presione GENERAR para ver el gráfico
              </div>
            )
          )}
        </div>
      </div>
    </AuditoriaPageFrame>
  );
}
