'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import type {
  PanelNpsDetalle,
  PanelNpsTablaRow,
  SedeSerieNps,
  TecnicoNpsPorSede,
} from '@/modules/informes/postventa/services/panel-nps.service';
import { panelNpsService } from '@/modules/informes/postventa/services/panel-nps.service';
import { getXlsx } from '@/utils/export-xlsx';
import { useToast } from '@/components/shared/ui/ToastContext';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_COPY, INFORMES_PV_TRIMENU } from '@/modules/informes/constants';
import { informesKeys } from '@/modules/informes/shared/constants/query-keys';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { PanelNpsTimeline } from '@/app/dashboard/informes/postventa/panel-nps/components/PanelNpsTimeline';
import { PanelNpsTablaResumen } from '@/app/dashboard/informes/postventa/panel-nps/components/PanelNpsTablaResumen';
import { PanelNpsDetalleModal } from '@/app/dashboard/informes/postventa/panel-nps/components/PanelNpsDetalleModal';
import { SEDES_CON_MATRIZ_TECNICOS } from '@/app/dashboard/informes/postventa/panel-nps/panel-nps-utils';

const MESES_COMPLETOS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function inferirMesesVentana(series: SedeSerieNps[] | undefined): number[] {
  const g = series?.find((s) => s.sede === 'general');
  if (g?.puntos?.length) {
    return g.puntos.map((p) => p.mes);
  }
  return [1, 2, 3, 4, 5, 6];
}

function formatExcelFechaHoy(): string {
  const f = new Date();
  return `${f.getDate()}-${f.getMonth() + 1}-${f.getFullYear()}`;
}

function nombreMesCompleto(mes: number): string {
  if (mes < 1 || mes > 12) return `Mes ${mes}`;
  return MESES_COMPLETOS[mes - 1];
}

function etiquetaSede(sede: string): string {
  if (sede === 'general') return 'General';
  return sede;
}

function etiquetaIndicador(row: PanelNpsTablaRow): string {
  if (row.tipo === 'tecnico') {
    return row.nombreTecnico ?? row.nitTecnico ?? '—';
  }
  return etiquetaSede(row.sede);
}

function npsExcel(nps: number | null | undefined): number | string {
  if (nps == null || !Number.isFinite(nps)) return '';
  return Number(nps.toFixed(1));
}

function npsPorMeses(
  puntos: { mes: number; nps: number | null }[],
  mesesVentana: number[],
): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const mes of mesesVentana) {
    const p = puntos.find((x) => x.mes === mes);
    out[nombreMesCompleto(mes)] = npsExcel(p?.nps ?? null);
  }
  return out;
}

function filasSerieExcel(
  series: SedeSerieNps[],
  tecnicosPorSede: TecnicoNpsPorSede[],
  mesesVentana: number[],
): Record<string, string | number>[] {
  const tecnicosPorSedeMap = new Map<string, TecnicoNpsPorSede[]>();
  for (const t of tecnicosPorSede) {
    if (!tecnicosPorSedeMap.has(t.sede)) tecnicosPorSedeMap.set(t.sede, []);
    tecnicosPorSedeMap.get(t.sede)!.push(t);
  }

  const rows: Record<string, string | number>[] = [];
  for (const serie of series) {
    const sedeLabel =
      serie.sede === 'general' ? 'NPS livianos (general)' : serie.sede;
    rows.push({
      Tipo: 'Sede',
      Sede: sedeLabel,
      Tecnico: '',
      ...npsPorMeses(serie.puntos, mesesVentana),
    });

    const mostrarMatriz = (
      SEDES_CON_MATRIZ_TECNICOS as readonly string[]
    ).includes(serie.sede);
    if (!mostrarMatriz) continue;

    for (const tec of tecnicosPorSedeMap.get(serie.sede) ?? []) {
      rows.push({
        Tipo: 'Técnico',
        Sede: serie.sede,
        Tecnico: tec.nombre,
        ...npsPorMeses(tec.puntos, mesesVentana),
      });
    }
  }
  return rows;
}

export function PanelNpsGestion() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_PV_TRIMENU.panelNps,
    redirectTo: '/dashboard/informes/postventa',
  });
  const { showError, showInfo } = useToast();
  const [loadingExport, setLoadingExport] = useState(false);
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

  const handleExportar = useCallback(async () => {
    const series = data?.series ?? [];
    const tecnicos = data?.tecnicosPorSede ?? [];
    if (tabla.length === 0 && series.length === 0) {
      showError('No hay datos para exportar');
      return;
    }
    setLoadingExport(true);
    try {
      const resumenRows = tabla.map((row) => ({
        Indicador: etiquetaIndicador(row),
        Tipo: row.tipo === 'tecnico' ? 'Técnico' : 'Sede',
        Sede: etiquetaSede(row.sede),
        D: row.enc0a6,
        N: row.enc7a8,
        P: row.enc9a10,
        PA: Math.round(row.to),
        NPS: npsExcel(row.nps),
        'META NPS': Math.round(row.meta),
      }));
      const serieRows = filasSerieExcel(series, tecnicos, mesesVentana);
      const XLSX = await getXlsx();
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(resumenRows),
        'Resumen',
      );
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(serieRows),
        'Serie 6 meses',
      );
      XLSX.writeFile(workbook, `Informe-NPS-${formatExcelFechaHoy()}.xlsx`);
    } catch {
      showError('No se pudo exportar el informe');
    } finally {
      setLoadingExport(false);
    }
  }, [data?.series, data?.tecnicosPorSede, mesesVentana, showError, tabla]);

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.panelNps.title}
      description={INFORMES_COPY.panelNps.description}
      backHref="/dashboard/informes/postventa"
      backLabel={INFORMES_COPY.backPv}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleExportar}
          disabled={
            loadingExport ||
            isPending ||
            (tabla.length === 0 && (data?.series.length ?? 0) === 0)
          }
          className={`inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
            tabla.length > 0 || (data?.series.length ?? 0) > 0
              ? 'bg-(--color-success) text-white hover:opacity-90'
              : 'border border-gray-300 text-gray-700 bg-white'
          }`}
        >
          {loadingExport && <Loader2 size={16} className="animate-spin" />}
          <FileSpreadsheet size={16} />
          <span>Exportar a Excel</span>
        </button>
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
        open={detalleRequest != null}
        detalle={detalle}
        isLoading={detalleLoading}
        onClose={cerrarDetalle}
      />
    </InformesPageFrame>
  );
}
