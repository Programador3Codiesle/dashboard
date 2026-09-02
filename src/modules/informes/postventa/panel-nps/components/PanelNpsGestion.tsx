'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type {
  PanelNpsDetalle,
  SedeSerieNps,
} from '@/modules/informes/postventa/services/panel-nps.service';
import { panelNpsService } from '@/modules/informes/postventa/services/panel-nps.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_COPY, INFORMES_PV_TRIMENU } from '@/modules/informes/constants';
import { informesKeys } from '@/modules/informes/shared/constants/query-keys';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { PanelNpsTimeline } from '@/app/dashboard/informes/postventa/panel-nps/components/PanelNpsTimeline';
import { PanelNpsTablaResumen } from '@/app/dashboard/informes/postventa/panel-nps/components/PanelNpsTablaResumen';
import { PanelNpsDetalleModal } from '@/app/dashboard/informes/postventa/panel-nps/components/PanelNpsDetalleModal';

function inferirMesesVentana(series: SedeSerieNps[] | undefined): number[] {
  const g = series?.find((s) => s.sede === 'general');
  if (g?.puntos?.length) {
    return g.puntos.map((p) => p.mes);
  }
  return [1, 2, 3, 4, 5, 6];
}

export function PanelNpsGestion() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_PV_TRIMENU.panelNps,
    redirectTo: '/dashboard/informes/postventa',
  });
  const { showError, showInfo } = useToast();
  const [detalleRequest, setDetalleRequest] = useState<
    | { tipo: 'general'; mes: number }
    | { tipo: 'sede'; sede: string; mes: number }
    | { tipo: 'tecnico'; nit: string; sede: string; mes: number }
    | null
  >(null);

  const {
    data,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: informesKeys.pv.panelNps('panel'),
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

  const {
    data: detalle = null,
    isFetching: detalleLoading,
    isError: detalleError,
    isFetched: detalleFetched,
  } = useQuery<PanelNpsDetalle | null>({
    queryKey: informesKeys.pv.panelNps(JSON.stringify({ detalle: detalleRequest })),
    queryFn: () => {
      if (!detalleRequest) return Promise.resolve(null);
      if (detalleRequest.tipo === 'general') {
        return panelNpsService.obtenerDetalleGeneral({ mes: detalleRequest.mes });
      }
      if (detalleRequest.tipo === 'sede') {
        return panelNpsService.obtenerDetalleSede({
          sede: detalleRequest.sede,
          mes: detalleRequest.mes,
        });
      }
      return panelNpsService.obtenerDetalleTecnico({
        nit: detalleRequest.nit,
        sede: detalleRequest.sede,
        mes: detalleRequest.mes,
      });
    },
    enabled: detalleRequest != null,
  });

  useEffect(() => {
    if (!detalleRequest || detalleLoading || !detalleFetched || detalleError) return;
    if (detalle !== null) return;
    if (detalleRequest.tipo === 'general') {
      showInfo('No hay detalle para el mes seleccionado.');
    } else if (detalleRequest.tipo === 'sede') {
      showInfo('No hay detalle para la sede y mes seleccionados.');
    } else {
      showInfo('No hay detalle para el técnico y mes seleccionados.');
    }
  }, [detalleRequest, detalleLoading, detalleFetched, detalleError, detalle, showInfo]);

  useEffect(() => {
    if (!detalleError || !detalleRequest) return;
    if (detalleRequest.tipo === 'general') {
      showError('No se pudo cargar el detalle general.');
    } else if (detalleRequest.tipo === 'sede') {
      showError('No se pudo cargar el detalle por sede.');
    } else {
      showError('No se pudo cargar el detalle por técnico.');
    }
  }, [detalleError, detalleRequest, showError]);

  const cerrarDetalle = useCallback(() => {
    setDetalleRequest(null);
  }, []);

  const abrirDetalleGeneral = useCallback(
    (mes: number) => {
      setDetalleRequest({ tipo: 'general', mes });
    },
    [],
  );

  const abrirDetalleSede = useCallback(
    (sede: string, mes: number) => {
      setDetalleRequest({ tipo: 'sede', sede, mes });
    },
    [],
  );

  const abrirDetalleTecnico = useCallback(
    (p: { nit: string; mes: number; sede: string }) => {
      setDetalleRequest({ tipo: 'tecnico', ...p });
    },
    [],
  );

  const mesMasRecienteGeneral = useMemo(() => {
    const generalSerie = data?.series.find((s) => s.sede === 'general');
    if (!generalSerie || generalSerie.puntos.length === 0) return null;
    return generalSerie.puntos[generalSerie.puntos.length - 1].mes;
  }, [data?.series]);

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.panelNps.title}
      description={INFORMES_COPY.panelNps.description}
      backHref="/dashboard/informes/postventa"
      backLabel={INFORMES_COPY.backPv}
    >
      {isError && (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-[--color-primary] hover:underline"
            onClick={() => refetch()}
          >
            Reintentar carga
          </button>
        </div>
      )}

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
        open={detalleRequest != null}
        detalle={detalle}
        isLoading={detalleLoading}
        onClose={cerrarDetalle}
      />
    </InformesPageFrame>
  );
}
