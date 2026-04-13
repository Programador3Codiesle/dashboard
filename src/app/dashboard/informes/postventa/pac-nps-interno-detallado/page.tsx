'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  pacNpsInternoDetalladoService,
  type PacNpsEncuestaTecnico,
  type PacNpsInternoBodega,
  type PacNpsTecnicoBodega,
} from '@/modules/informes/postventa/services/pac-nps-interno-detallado.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import {
  PacNpsBodegaCell,
  PacNpsEncuestaDetalleBlock,
  PacNpsTecnicoRow,
} from './pac-nps-detallado-memo';

function getDefaultMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

function formatNps(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return '0.00';
  return n.toFixed(2);
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportarResumenYDetalleBodegaXlsx(
  bodegas: PacNpsInternoBodega[],
  tecnicos: PacNpsTecnicoBodega[] | undefined,
  tituloDetalleBodega: string | null,
) {
  const wb = XLSX.utils.book_new();
  const headers = bodegas.map((b) => b.descripcion);
  const rowVals = bodegas.map(
    (b) =>
      `Orden finalizadas: ${b.ordenesFinalizadas} | Encuestas: ${b.encuestas} | NPS: ${formatNps(b.nps)}%`,
  );
  const wsRes = XLSX.utils.aoa_to_sheet([headers, rowVals]);
  XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen bodegas');

  if (tecnicos?.length && tituloDetalleBodega) {
    const det = [
      ['Técnico', 'N° Órdenes', 'N° Encuestas'],
      ...tecnicos.map((t) => [t.tecnico, t.ordenes, t.encuestas]),
    ];
    const wsDet = XLSX.utils.aoa_to_sheet(det);
    const safeName = tituloDetalleBodega.replace(/[[\]*?:/\\]/g, '').slice(0, 28) || 'Detalle';
    XLSX.utils.book_append_sheet(wb, wsDet, safeName);
  }

  XLSX.writeFile(wb, 'Informe Ordenes Finalizadas vs Encuestas realizadas.xlsx');
}

export default function PacNpsInternoDetalladoPage() {
  const [month, setMonth] = useState<string>(getDefaultMonth);
  const [consultaFecha, setConsultaFecha] = useState<string | null>(null);
  const [bodegaSel, setBodegaSel] = useState<{
    id: number;
    descripcion: string;
  } | null>(null);
  const [modalTecnico, setModalTecnico] = useState<string | null>(null);
  const { showError, showInfo } = useToast();

  const {
    data: resumen,
    isFetching: cargandoResumen,
    error: errorResumen,
  } = useQuery({
    queryKey: ['pac-nps-interno-detallado', consultaFecha],
    queryFn: () => pacNpsInternoDetalladoService.listar(consultaFecha!),
    enabled: !!consultaFecha,
  });

  useEffect(() => {
    if (errorResumen) {
      showError('No se pudo cargar el informe de órdenes finalizadas vs encuestas realizadas.');
    }
  }, [errorResumen, showError]);

  useEffect(() => {
    if (resumen && consultaFecha && !resumen.bodegas.length) {
      showInfo('No hay datos para el mes seleccionado.');
    }
  }, [resumen, consultaFecha, showInfo]);

  const {
    data: tecnicos,
    isFetching: cargandoTecnicos,
    error: errorTecnicos,
  } = useQuery({
    queryKey: ['pac-nps-tecnicos', consultaFecha, bodegaSel?.id],
    queryFn: () =>
      pacNpsInternoDetalladoService.listarTecnicos(consultaFecha!, bodegaSel!.id),
    enabled: !!consultaFecha && !!bodegaSel,
  });

  useEffect(() => {
    if (errorTecnicos) {
      showError('No se pudo cargar el detalle de técnicos por bodega.');
    }
  }, [errorTecnicos, showError]);

  const {
    data: encuestasModal,
    isFetching: cargandoEncuestas,
    error: errorEncuestas,
  } = useQuery({
    queryKey: ['pac-nps-encuestas', consultaFecha, modalTecnico],
    queryFn: () =>
      pacNpsInternoDetalladoService.listarEncuestasTecnico(
        consultaFecha!,
        modalTecnico!,
      ),
    enabled: !!consultaFecha && !!modalTecnico,
  });

  useEffect(() => {
    if (errorEncuestas) {
      showError('No se pudo cargar el detalle de encuestas del técnico.');
    }
  }, [errorEncuestas, showError]);

  const handleBuscar = useCallback(() => {
    if (!month) {
      showInfo('Seleccione un año y mes para realizar la búsqueda.');
      return;
    }
    setConsultaFecha(month);
    setBodegaSel(null);
    setModalTecnico(null);
  }, [month, showInfo]);

  const onSelectBodega = useCallback((bodega: number, descripcion: string) => {
    setBodegaSel({ id: bodega, descripcion });
    setModalTecnico(null);
  }, []);

  const onVerTecnico = useCallback((nombre: string) => {
    setModalTecnico(nombre);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalTecnico(null);
  }, []);

  const bodegas = resumen?.bodegas ?? [];

  const handleDescargarTablas = useCallback(() => {
    if (!resumen?.bodegas.length) {
      showInfo('Primero ejecute una búsqueda con datos.');
      return;
    }
    exportarResumenYDetalleBodegaXlsx(
      resumen.bodegas,
      tecnicos,
      bodegaSel?.descripcion ?? null,
    );
  }, [resumen, tecnicos, bodegaSel, showInfo]);

  const handleExportDetalleTecnico = useCallback(async () => {
    if (!consultaFecha || !modalTecnico) return;
    try {
      const blob = await pacNpsInternoDetalladoService.exportarDetalleTecnico(
        consultaFecha,
        modalTecnico,
      );
      const safe = modalTecnico.replace(/[^A-Za-z0-9_\-]/g, '_') || 'Detalle_NPS';
      triggerBlobDownload(
        blob,
        `${safe}_${consultaFecha.replace(/-/g, '')}.xlsx`,
      );
    } catch {
      showError('No se pudo generar el Excel del técnico.');
    }
  }, [consultaFecha, modalTecnico, showError]);

  const handleExportTodos = useCallback(async () => {
    if (!consultaFecha) {
      showInfo('Seleccione un año y mes primero.');
      return;
    }
    try {
      const bodega =
        bodegaSel && bodegaSel.id > 0 ? bodegaSel.id : undefined;
      const blob = await pacNpsInternoDetalladoService.exportarTodos(
        consultaFecha,
        bodega,
      );
      triggerBlobDownload(
        blob,
        `Detalle_NPS_Todos_${consultaFecha.replace(/-/g, '')}.xlsx`,
      );
    } catch {
      showError('No se pudo generar el Excel de todos los técnicos.');
    }
  }, [consultaFecha, bodegaSel, showInfo, showError]);

  const celdasBodega = useMemo(
    () =>
      bodegas.map((b) => (
        <PacNpsBodegaCell
          key={b.bodega}
          bodega={b.bodega}
          descripcion={b.descripcion}
          ordenesFinalizadas={b.ordenesFinalizadas}
          encuestas={b.encuestas}
          nps={formatNps(b.nps)}
          onSelect={onSelectBodega}
        />
      )),
    [bodegas, onSelectBodega],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">
            Órdenes finalizadas vs encuestas realizadas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Comparativo por bodega, detalle por técnico y exportaciones (paridad con informe
            legacy).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Año y mes</p>
            <input
              type="month"
              className="w-full rounded-md border border-gray-300 text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <button
              type="button"
              onClick={handleBuscar}
              disabled={cargandoResumen}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md brand-btn text-sm font-medium disabled:opacity-60"
            >
              {cargandoResumen && <Loader2 size={16} className="animate-spin" />}
              {cargandoResumen ? 'Cargando...' : 'Buscar'}
            </button>
            <button
              type="button"
              onClick={handleDescargarTablas}
              disabled={!resumen?.bodegas.length}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-red-200 bg-red-50 text-red-800 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
            >
              Descargar (tablas)
            </button>
            {consultaFecha && (
              <button
                type="button"
                onClick={handleExportTodos}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700"
              >
                Descargar detalle de todos los técnicos
              </button>
            )}
          </div>
          <div className="flex flex-col justify-end text-xs text-gray-600 space-y-1">
            <div>
              <span className="font-semibold">Total órdenes finalizadas: </span>
              {resumen?.cantOrdenes ?? '—'}
            </div>
            <div>
              <span className="font-semibold">Total encuestas realizadas: </span>
              {resumen?.cantEncuestas ?? '—'}
            </div>
          </div>
        </div>
      </div>

      {consultaFecha && (
        <div className="bg-white rounded-xl border brand-border shadow-sm overflow-x-auto">
          <table className="min-w-full border-collapse text-sm" id="tabla_bodega_encuestas">
            <thead>
              <tr>{bodegas.map((b) => (
                <th
                  key={b.bodega}
                  scope="col"
                  className="border border-gray-200 bg-gray-50 px-2 py-2 text-center text-xs font-semibold text-gray-700 min-w-[120px]"
                >
                  {b.descripcion}
                </th>
              ))}</tr>
            </thead>
            <tbody>
              <tr>{celdasBodega}</tr>
            </tbody>
          </table>
          {!cargandoResumen && bodegas.length === 0 && (
            <p className="p-4 text-center text-gray-500 text-sm">
              No hay datos para el mes seleccionado.
            </p>
          )}
        </div>
      )}

      {consultaFecha && bodegaSel && (
        <div className="bg-white rounded-xl border brand-border shadow-sm p-4 md:p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Técnicos — {bodegaSel.descripcion}
          </h2>
          <div className="overflow-x-auto border border-gray-100 rounded-lg" id="tabla_detalle_bodega_wrap">
            {cargandoTecnicos ? (
              <div className="flex items-center justify-center py-12 text-gray-500 gap-2">
                <Loader2 className="animate-spin" size={20} />
                Cargando técnicos…
              </div>
            ) : (
              <table className="min-w-full text-sm" id="tabla_detalle_bodega">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th colSpan={4} className="py-2 px-3 text-center font-semibold text-gray-800" id="descBodega">
                      {bodegaSel.descripcion}
                    </th>
                  </tr>
                  <tr className="text-center text-xs text-gray-600">
                    <th className="py-2 px-2">Técnico</th>
                    <th className="py-2 px-2">N° Órdenes</th>
                    <th className="py-2 px-2">N° Encuestas</th>
                    <th className="py-2 px-2">Ver detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {(tecnicos ?? []).map((t) => (
                    <PacNpsTecnicoRow
                      key={`${t.tecnico}-${t.bodega}`}
                      tecnico={t.tecnico}
                      ordenes={t.ordenes}
                      encuestas={t.encuestas}
                      onVer={onVerTecnico}
                    />
                  ))}
                </tbody>
              </table>
            )}
            {!cargandoTecnicos && (tecnicos?.length ?? 0) === 0 && (
              <p className="p-6 text-center text-gray-500 text-sm">No hay técnicos para esta bodega.</p>
            )}
          </div>
        </div>
      )}

      {modalTecnico && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pac-nps-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrarModal();
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
              <h3 id="pac-nps-modal-title" className="text-lg font-semibold text-gray-900">
                Detalle de encuestas — {modalTecnico}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportDetalleTecnico}
                  className="rounded-md bg-blue-600 text-white text-sm font-medium px-3 py-1.5 hover:bg-blue-700"
                >
                  Descargar Excel
                </button>
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="rounded-md border border-gray-300 text-sm px-3 py-1.5 hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4 md:p-6">
              {cargandoEncuestas ? (
                <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
                  <Loader2 className="animate-spin" size={22} />
                  Cargando encuestas…
                </div>
              ) : encuestasModal?.length ? (
                encuestasModal.map((item: PacNpsEncuestaTecnico) => (
                  <PacNpsEncuestaDetalleBlock key={`${item.numero}-${item.nombres}`} item={item} />
                ))
              ) : (
                <p className="text-center text-gray-600 py-8">No se encontró información.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
