'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  PanelNpsDetalle,
  SedeSerieNps,
} from '@/modules/informes/postventa/services/panel-nps.service';
import { panelNpsService } from '@/modules/informes/postventa/services/panel-nps.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { PanelNpsTimeline } from './components/PanelNpsTimeline';
import { PanelNpsTablaResumen } from './components/PanelNpsTablaResumen';
import { PanelNpsDetalleModal } from './components/PanelNpsDetalleModal';

function inferirMesesVentana(series: SedeSerieNps[] | undefined): number[] {
  const g = series?.find((s) => s.sede === 'general');
  if (g?.puntos?.length) {
    return g.puntos.map((p) => p.mes);
  }
  return [1, 2, 3, 4, 5, 6];
}

export default function PanelNpsPage() {
  const { showError, showInfo } = useToast();
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalle, setDetalle] = useState<PanelNpsDetalle | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['informes', 'postventa', 'panel-nps'],
    queryFn: () => panelNpsService.obtenerPanel(),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (isError) {
      showError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el panel de gestión NPS.',
      );
    }
  }, [isError, error, showError]);

  useEffect(() => {
    if (data && !data.series.length) {
      showInfo('No hay datos para mostrar en el panel NPS.');
    }
  }, [data, showInfo]);

  const mesesVentana = useMemo(() => {
    if (data?.mesesVentana?.length === 6) {
      return data.mesesVentana;
    }
    return inferirMesesVentana(data?.series);
  }, [data?.mesesVentana, data?.series]);

  const tabla = useMemo(() => {
    const rows = data?.tabla ?? [];
    return rows.map((row) => ({
      ...row,
      tipo: row.tipo ?? ('sede' as const),
    }));
  }, [data?.tabla]);

  const cerrarDetalle = useCallback(() => {
    setDetalleOpen(false);
    setDetalle(null);
    setDetalleLoading(false);
  }, []);

  const abrirDetalleGeneral = useCallback(
    async (mes: number) => {
      setDetalleOpen(true);
      setDetalleLoading(true);
      setDetalle(null);
      try {
        const resp = await panelNpsService.obtenerDetalleGeneral({ mes });
        if (!resp) {
          showInfo('No hay detalle para el mes seleccionado.');
        }
        setDetalle(resp);
      } catch {
        showError('No se pudo cargar el detalle general.');
        setDetalle(null);
      } finally {
        setDetalleLoading(false);
      }
    },
    [showError, showInfo],
  );

  const abrirDetalleSede = useCallback(
    async (sede: string, mes: number) => {
      setDetalleOpen(true);
      setDetalleLoading(true);
      setDetalle(null);
      try {
        const resp = await panelNpsService.obtenerDetalleSede({ sede, mes });
        if (!resp) {
          showInfo('No hay detalle para la sede y mes seleccionados.');
        }
        setDetalle(resp);
      } catch {
        showError('No se pudo cargar el detalle por sede.');
        setDetalle(null);
      } finally {
        setDetalleLoading(false);
      }
    },
    [showError, showInfo],
  );

  const abrirDetalleTecnico = useCallback(
    async (p: { nit: string; mes: number; sede: string }) => {
      setDetalleOpen(true);
      setDetalleLoading(true);
      setDetalle(null);
      try {
        const resp = await panelNpsService.obtenerDetalleTecnico(p);
        if (!resp) {
          showInfo('No hay detalle para el técnico y mes seleccionados.');
        }
        setDetalle(resp);
      } catch {
        showError('No se pudo cargar el detalle por técnico.');
        setDetalle(null);
      } finally {
        setDetalleLoading(false);
      }
    },
    [showError, showInfo],
  );

  const mesMasRecienteGeneral = useMemo(() => {
    const generalSerie = data?.series.find((s) => s.sede === 'general');
    if (!generalSerie || generalSerie.puntos.length === 0) return null;
    return generalSerie.puntos[generalSerie.puntos.length - 1].mes;
  }, [data?.series]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">
            Panel Gestión NPS
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Evolución del NPS general y por sede en los últimos 6 meses, matriz
            por técnico y resumen del mes calendario actual (paridad con el
            panel legacy).
          </p>
        </div>
        {isError && (
          <button
            type="button"
            className="text-sm text-[--color-primary] hover:underline"
            onClick={() => refetch()}
          >
            Reintentar carga
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
        <div className="min-w-0">
          <PanelNpsTimeline
            mesesVentana={mesesVentana}
            series={data?.series ?? []}
            tecnicosPorSede={data?.tecnicosPorSede ?? []}
            isLoading={isPending}
            onDetalleGeneral={abrirDetalleGeneral}
            onDetalleSede={abrirDetalleSede}
            onDetalleTecnico={abrirDetalleTecnico}
          />
        </div>

        <div className="min-w-0">
          <PanelNpsTablaResumen tabla={tabla} isLoading={isPending} />
          {mesMasRecienteGeneral != null && (
            <div className="mt-3 text-right">
              <button
                type="button"
                className="text-[11px] text-[--color-primary] hover:underline"
                onClick={() => abrirDetalleGeneral(mesMasRecienteGeneral)}
              >
                Ver detalle general último mes en serie
              </button>
            </div>
          )}
        </div>
      </div>

      <PanelNpsDetalleModal
        open={detalleOpen}
        detalle={detalle}
        isLoading={detalleLoading}
        onClose={cerrarDetalle}
      />
    </div>
  );
}
