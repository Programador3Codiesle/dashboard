import { memo, useMemo } from 'react';
import type {
  SedeSerieNps,
  TecnicoNpsPorSede,
} from '@/modules/informes/postventa/services/panel-nps.service';
import {
  nombreMes,
  puntosAlineadosAVentana,
  SEDES_CON_MATRIZ_TECNICOS,
} from '../panel-nps-utils';
import { PanelNpsMesCeldas } from './PanelNpsMesCeldas';
import { PanelNpsCamionesPlaceholder } from './PanelNpsCamionesPlaceholder';

export type PanelNpsTimelineProps = {
  mesesVentana: number[];
  series: SedeSerieNps[];
  tecnicosPorSede: TecnicoNpsPorSede[];
  isLoading: boolean;
  onDetalleGeneral: (mes: number) => void;
  onDetalleSede: (sede: string, mes: number) => void;
  onDetalleTecnico: (p: { nit: string; mes: number; sede: string }) => void;
};

export const PanelNpsTimeline = memo(function PanelNpsTimeline({
  mesesVentana,
  series,
  tecnicosPorSede,
  isLoading,
  onDetalleGeneral,
  onDetalleSede,
  onDetalleTecnico,
}: PanelNpsTimelineProps) {
  const tecnicosPorSedeMap = useMemo(() => {
    const m = new Map<string, TecnicoNpsPorSede[]>();
    for (const t of tecnicosPorSede) {
      if (!m.has(t.sede)) m.set(t.sede, []);
      m.get(t.sede)!.push(t);
    }
    return m;
  }, [tecnicosPorSede]);

  return (
    <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        NPS últimos 6 meses por sede y técnico
      </h2>
      <div className="space-y-4">
        {series.map((serie) => {
          const celdasSerie = puntosAlineadosAVentana(
            serie.puntos,
            mesesVentana,
          );
          const ultimoMesConDato =
            serie.puntos.length > 0
              ? serie.puntos[serie.puntos.length - 1].mes
              : null;
          const mostrarMatriz = (
            SEDES_CON_MATRIZ_TECNICOS as readonly string[]
          ).includes(serie.sede);
          const tecnicos = mostrarMatriz
            ? (tecnicosPorSedeMap.get(serie.sede) ?? [])
            : [];

          return (
            <div key={serie.sede} className="space-y-2 border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="font-semibold capitalize text-gray-800">
                  {serie.sede === 'general' ? 'NPS livianos (general)' : serie.sede}
                </span>
                {ultimoMesConDato != null && (
                  <span className="text-gray-500">
                    Mes más reciente con dato en serie sede:{' '}
                    {nombreMes(ultimoMesConDato)}
                  </span>
                )}
              </div>
              <PanelNpsMesCeldas
                cells={celdasSerie}
                allowClickWhenNull
                onMonthClick={(mes) => {
                  if (serie.sede === 'general') {
                    onDetalleGeneral(mes);
                  } else {
                    onDetalleSede(serie.sede, mes);
                  }
                }}
              />
              {mostrarMatriz && tecnicos.length > 0 && (
                <div className="pl-4 md:pl-8 space-y-2 border-l-2 border-purple-100">
                  {tecnicos.map((tec) => (
                    <div key={`${tec.sede}-${tec.nit}`} className="space-y-1">
                      <div className="text-[11px] font-medium text-gray-700">
                        {tec.nombre}
                      </div>
                      <PanelNpsMesCeldas
                        cells={tec.puntos}
                        allowClickWhenNull={false}
                        onMonthClick={(mes) =>
                          onDetalleTecnico({
                            nit: tec.nit,
                            mes,
                            sede: tec.sede,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {!isLoading && series.length === 0 && (
          <div className="text-center text-gray-500 text-sm">
            No hay datos de NPS para mostrar.
          </div>
        )}
      </div>
      <PanelNpsCamionesPlaceholder />
    </div>
  );
});
