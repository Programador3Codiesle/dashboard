'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  catalogQueryOptions,
  transactionalQueryOptions,
} from '@/core/query/catalog-query-options';
import { MantenimientoPageFrame } from '@/modules/mantenimiento/components/MantenimientoPageFrame';
import { MANTENIMIENTO_COPY } from '@/modules/mantenimiento/constants';
import { MantenimientoFileField } from '@/modules/mantenimiento/shared/components/MantenimientoFileField';
import { MantenimientoInfoChip } from '@/modules/mantenimiento/shared/components/MantenimientoInfoChip';
import { MantenimientoQueryError } from '@/modules/mantenimiento/shared/components/MantenimientoQueryError';
import { mantenimientoKeys } from '@/modules/mantenimiento/shared/constants/query-keys';
import {
  btnInfoClass,
  btnSuccessClass,
  btnWarningClass,
} from '@/modules/mantenimiento/shared/constants/ui';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { mantenimientoService } from '@/modules/mantenimiento/shared/services/mantenimiento.service';
import { getErrorMessage } from '@/modules/mantenimiento/shared/utils/parse-api-error';
import { estadoLabel } from '@/modules/mantenimiento/shared/constants/labels';
import { PERIODOS_MTTO } from '@/modules/mantenimiento/equipos/utils/hoja-vida';
import { MTTO_PREVENTIVO_SUBMENU_ID } from '@/utils/constants';
import { fetchWithAuth } from '@/utils/api';

export function MttoPreventivoGestion() {
  const { blocked, user } = useMantenimientoPageGuard(MTTO_PREVENTIVO_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;
  const [orden, setOrden] = useState<Record<string, unknown> | null>(null);
  const [modalUpload, setModalUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [asignado, setAsignado] = useState('*');
  const [obs, setObs] = useState('');
  const [piezas, setPiezas] = useState('');
  const [modalReasignar, setModalReasignar] = useState(false);
  const [periodoSelect, setPeriodoSelect] = useState('');
  const [finalizando, setFinalizando] = useState(false);

  const perfil = Number(user?.perfil_postventa ?? 0);
  const puedeAdmin = perfil === 46 || perfil === 20;
  const puedeGestionar = perfil === 46;

  const catalogQuery = useQuery({
    queryKey: mantenimientoKeys.catalogos,
    queryFn: () => mantenimientoService.catalogos(),
    enabled: sesionLista,
    ...catalogQueryOptions,
  });

  const eventosQuery = useQuery({
    queryKey: mantenimientoKeys.preventivoEventos,
    queryFn: () => mantenimientoService.eventosPreventivo(),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const personal = catalogQuery.data?.personal ?? [];
  const events = (eventosQuery.data ?? [])
    .filter((e) => e.start)
    .map((e) => ({
      id: String(e.id),
      title: e.title,
      start: e.start,
      allDay: true as const,
      backgroundColor: e.color,
      borderColor: e.color,
    }));

  async function invalidatePreventivo() {
    await queryClient.invalidateQueries({
      queryKey: mantenimientoKeys.preventivoEventos,
    });
    await queryClient.invalidateQueries({
      queryKey: mantenimientoKeys.preventivoListado,
    });
  }

  async function openOrden(id: string) {
    try {
      const o = await mantenimientoService.getOrdenPreventivo(Number(id));
      setOrden(o);
      setAsignado('*');
      setObs('');
      setPiezas('');
      setModalReasignar(false);
      setPeriodoSelect('');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
    }
  }

  function abrirModalReasignar() {
    if (!obs.trim() || !piezas.trim()) {
      showError('Observación y piezas requeridos');
      return;
    }
    const periodoActual = String(orden?.periodo_mtto_preventivo ?? '').trim();
    setPeriodoSelect(periodoActual || '');
    setModalReasignar(true);
  }

  async function confirmarFinalizar(reasignar: boolean) {
    if (!orden) return;
    if (reasignar) {
      const periodoActual = String(orden.periodo_mtto_preventivo ?? '').trim();
      const periodo = periodoActual || periodoSelect;
      if (!periodo || !PERIODO_MESES[periodo]) {
        showError('Seleccione un periodo para reasignar');
        return;
      }
    }
    setFinalizando(true);
    try {
      const periodoActual = String(orden.periodo_mtto_preventivo ?? '').trim();
      const res = await mantenimientoService.finalizarOrden(
        Number(orden.id_mantenimientos),
        obs,
        piezas,
        {
          reasignar,
          periodo: reasignar && !periodoActual ? periodoSelect : undefined,
        },
      );
      showSuccess(
        reasignar && res?.fecha_requerida
          ? `Finalizada y reasignada para ${String(res.fecha_requerida)}`
          : 'Finalizada',
      );
      setModalReasignar(false);
      setOrden(null);
      await invalidatePreventivo();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
    } finally {
      setFinalizando(false);
    }
  }

  async function descargarPlantilla() {
    try {
      const resp = await fetchWithAuth(mantenimientoService.plantillaUrl());
      if (!resp.ok) throw new Error('No se pudo descargar la plantilla');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PlantillaPlanDeMantenimientoPreventivo.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
    }
  }

  async function cargarCronograma() {
    if (!uploadFile) {
      showError('Seleccione un archivo Excel');
      return;
    }
    setUploading(true);
    try {
      const res = await mantenimientoService.uploadCronograma(uploadFile);
      showSuccess(`Insertados ${res.ok}, errores ${res.err_db}`);
      setModalUpload(false);
      setUploadFile(null);
      await invalidatePreventivo();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error');
    } finally {
      setUploading(false);
    }
  }

  if (blocked) return null;

  return (
    <MantenimientoPageFrame title={MANTENIMIENTO_COPY.preventivo.title}>
      {eventosQuery.isError ? (
        <MantenimientoQueryError
          message={getErrorMessage(
            eventosQuery.error,
            MANTENIMIENTO_COPY.preventivo.loadError,
          )}
        />
      ) : null}

      {puedeAdmin && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={btnSuccessClass}
            onClick={() => {
              setUploadFile(null);
              setModalUpload(true);
            }}
          >
            Subir cronograma
          </button>
          <button
            type="button"
            className={btnWarningClass}
            onClick={descargarPlantilla}
          >
            Descargar Plantilla
          </button>
          <Link
            href="/dashboard/mantenimiento/mtto-preventivo/listado"
            className={btnInfoClass}
          >
            Ver listado Plantilla
          </Link>
        </div>
      )}

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          aspectRatio={1.8}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listWeek',
          }}
          events={events}
          eventClick={(arg) => {
            void openOrden(arg.event.id);
          }}
        />
      </div>

      {orden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-(--color-primary) px-5 py-4 text-white">
              <div>
                <h2 className="text-lg font-semibold">Orden de Mantenimiento Preventivo</h2>
                <p className="text-xs text-white/80">
                  {String(orden.codigo)} — {String(orden.nombre_equipo)}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-1.5 hover:bg-white/15"
                onClick={() => setOrden(null)}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <MantenimientoInfoChip
                  label="Estado"
                  value={estadoLabel(orden.estado as string, 'prev')}
                  tone={estadoTonePrev(orden.estado as string)}
                />
                <MantenimientoInfoChip label="Bodega" value={String(orden.bodega ?? '')} />
                <MantenimientoInfoChip
                  label="Periodo mtto"
                  value={periodoLabel(orden.periodo_mtto_preventivo)}
                />
                <MantenimientoInfoChip
                  label="Responsable"
                  value={String(orden.nombre_responsable ?? '—')}
                />
                <MantenimientoInfoChip
                  label="Asignado"
                  value={String(orden.nombre_asignado ?? '—')}
                />
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Descripción
                </p>
                <p className="whitespace-pre-wrap text-sm text-gray-800">
                  {String(orden.descripcion ?? '') || '—'}
                </p>
              </div>

              {puedeGestionar && Number(orden.estado) === 1 && (
                <div className="space-y-3 rounded-xl border border-[color-mix(in_srgb,var(--color-info)_25%,white)] bg-[color-mix(in_srgb,var(--color-info)_8%,white)] p-4">
                  <p className="text-sm font-semibold text-[var(--color-info)]">Gestionar orden</p>
                  <label className="block text-sm font-medium text-gray-700">
                    Asignado
                    <select
                      className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={asignado}
                      onChange={(e) => setAsignado(e.target.value)}
                    >
                      <option value="*">Seleccione asignado</option>
                      {personal.map((p) => (
                        <option key={p.nit} value={p.nit}>
                          {p.nombres}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className="w-full rounded-md bg-[var(--color-info)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    onClick={async () => {
                      try {
                        await mantenimientoService.iniciarOrden(
                          Number(orden.id_mantenimientos),
                          asignado,
                        );
                        showSuccess('Iniciada');
                        setOrden(null);
                        await invalidatePreventivo();
                      } catch (e) {
                        showError(e instanceof Error ? e.message : 'Error');
                      }
                    }}
                  >
                    Iniciar
                  </button>
                </div>
              )}

              {puedeGestionar && Number(orden.estado) === 2 && (
                <div className="space-y-3 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_25%,white)] bg-[var(--color-success-soft)] p-4">
                  <p className="text-sm font-semibold text-[var(--color-success)]">Finalizar orden</p>
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Observaciones"
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                  />
                  <textarea
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Detalle piezas"
                    value={piezas}
                    onChange={(e) => setPiezas(e.target.value)}
                  />
                  <button
                    type="button"
                    className="w-full rounded-md bg-[var(--color-success)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    onClick={abrirModalReasignar}
                  >
                    Finalizar
                  </button>
                </div>
              )}

              {Number(orden.estado) === 3 && (
                <div className="space-y-3 rounded-xl border border-green-100 bg-green-50/40 p-4">
                  <p className="text-sm font-semibold text-green-900">
                    Cierre del mantenimiento
                  </p>
                  <div className="rounded-lg border border-gray-100 bg-white p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Observaciones
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-gray-800">
                      {String(orden.observaciones ?? '') || '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-white p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Detalle piezas
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-gray-800">
                      {String(orden.detalle_piezas ?? '') || '—'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t bg-gray-50 px-5 py-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setOrden(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {orden && modalReasignar && (
        <ModalReasignarPreventivo
          periodoEquipo={String(orden.periodo_mtto_preventivo ?? '').trim()}
          periodoSelect={periodoSelect}
          onPeriodoChange={setPeriodoSelect}
          busy={finalizando}
          onNo={() => void confirmarFinalizar(false)}
          onSi={() => void confirmarFinalizar(true)}
          onClose={() => {
            if (!finalizando) setModalReasignar(false);
          }}
        />
      )}

      {modalUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-(--color-primary) px-5 py-4 text-white">
              <h2 className="text-lg font-semibold">Cargar plan de mantenimiento</h2>
              <button
                type="button"
                className="rounded-md p-1.5 hover:bg-white/15"
                onClick={() => {
                  setModalUpload(false);
                  setUploadFile(null);
                }}
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <MantenimientoFileField
                label="Archivo Excel del cronograma"
                file={uploadFile}
                accept=".xlsx,.xls"
                onChange={setUploadFile}
              />
            </div>
            <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-3">
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setModalUpload(false);
                  setUploadFile(null);
                }}
              >
                Cerrar
              </button>
              <button
                type="button"
                disabled={uploading || !uploadFile}
                className={`${btnSuccessClass} disabled:opacity-50`}
                onClick={() => void cargarCronograma()}
              >
                {uploading ? 'Cargando…' : 'Cargar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MantenimientoPageFrame>
  );
}

function periodoLabel(periodo: unknown) {
  const v = String(periodo ?? '').trim();
  if (!v) return 'No aplica';
  return PERIODOS_MTTO.find((p) => p.value === v)?.label ?? v;
}

const PERIODO_MESES: Record<string, number> = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

function todayYmdLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addMonthsYmd(ymd: string, months: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatFechaEs(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return ymd;
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ModalReasignarPreventivo({
  periodoEquipo,
  periodoSelect,
  onPeriodoChange,
  busy,
  onNo,
  onSi,
  onClose,
}: {
  periodoEquipo: string;
  periodoSelect: string;
  onPeriodoChange: (v: string) => void;
  busy: boolean;
  onNo: () => void;
  onSi: () => void;
  onClose: () => void;
}) {
  const periodoEfectivo = periodoEquipo || periodoSelect;
  const meses = PERIODO_MESES[periodoEfectivo];
  const fechaProx = meses ? addMonthsYmd(todayYmdLocal(), meses) : '';
  const sinPeriodo = !periodoEquipo;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-(--color-primary) px-5 py-4 text-white">
          <h2 className="text-lg font-semibold">Reasignar preventivo</h2>
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-white/15 disabled:opacity-50"
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-sm text-gray-700">
            ¿Desea reasignar el mantenimiento preventivo de este equipo para el
            próximo periodo?
          </p>

          {sinPeriodo ? (
            <label className="block text-sm font-medium text-gray-700">
              Periodo de mantenimiento *
              <select
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={periodoSelect}
                onChange={(e) => onPeriodoChange(e.target.value)}
                disabled={busy}
              >
                <option value="">Seleccione periodo</option>
                {PERIODOS_MTTO.filter((p) => p.value).map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              Periodo del equipo:{' '}
              <span className="font-semibold">{periodoLabel(periodoEquipo)}</span>
            </p>
          )}

          {fechaProx ? (
            <p className="rounded-lg border border-[color-mix(in_srgb,var(--color-info)_25%,white)] bg-[color-mix(in_srgb,var(--color-info)_8%,white)] px-3 py-2 text-sm text-[var(--color-info)]">
              Nueva fecha requerida:{' '}
              <span className="font-semibold">{formatFechaEs(fechaProx)}</span>
            </p>
          ) : null}

          <p className="text-xs text-gray-500">
            Si elige <strong>No</strong>, la orden queda en Realizado y no se
            crea una nueva solicitud.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-3">
          <button
            type="button"
            disabled={busy}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            onClick={onNo}
          >
            {busy ? '…' : 'No'}
          </button>
          <button
            type="button"
            disabled={busy || (sinPeriodo && !periodoSelect)}
            className={`${btnSuccessClass} disabled:opacity-50`}
            onClick={onSi}
          >
            {busy ? 'Procesando…' : 'Sí, reasignar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function estadoTonePrev(estado: number | string) {
  const n = Number(estado);
  if (n === 1)
    return 'border-[color-mix(in_srgb,var(--color-info)_35%,white)] bg-[color-mix(in_srgb,var(--color-info)_10%,white)] text-[var(--color-info)]';
  if (n === 2)
    return 'border-[color-mix(in_srgb,var(--color-warning)_40%,white)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]';
  if (n === 3)
    return 'border-[color-mix(in_srgb,var(--color-success)_25%,white)] bg-[var(--color-success-soft)] text-[var(--color-success)]';
  return 'border-gray-100 bg-white text-gray-900';
}
