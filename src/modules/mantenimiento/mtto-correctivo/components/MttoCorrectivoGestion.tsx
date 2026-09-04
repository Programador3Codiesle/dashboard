'use client';

import { useCallback, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Wrench, X } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
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
  btnIconClass,
  btnPrimaryClass,
  btnSecondaryClass,
  btnSuccessClass,
} from '@/modules/mantenimiento/shared/constants/ui';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { mantenimientoService } from '@/modules/mantenimiento/shared/services/mantenimiento.service';
import { getErrorMessage } from '@/modules/mantenimiento/shared/utils/parse-api-error';
import {
  estadoLabel,
  urgenciaLabel,
} from '@/modules/mantenimiento/shared/constants/labels';
import { MTTO_CORRECTIVO_SUBMENU_ID } from '@/utils/constants';
import { getApiPublicUrl } from '@/config/public-env';

const PAGE_SIZE = 10;

function solicitudImgUrl(name: string | null | undefined) {
  if (!name) return null;
  return `${getApiPublicUrl()}/mantenimiento/solicitudes/${encodeURIComponent(String(name))}`;
}

function EvidenciaImg({
  label,
  filename,
}: {
  label: string;
  filename: string | null | undefined;
}) {
  const url = solicitudImgUrl(filename);
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={label}
            className="max-h-40 w-full rounded-lg object-contain bg-white"
          />
          <span className="mt-1 inline-block text-xs text-[var(--color-info)] underline">
            Abrir imagen
          </span>
        </a>
      ) : (
        <p className="text-xs text-gray-500">Sin imagen</p>
      )}
    </div>
  );
}

export function MttoCorrectivoGestion() {
  const { blocked, user } = useMantenimientoPageGuard(MTTO_CORRECTIVO_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;
  const [modalNueva, setModalNueva] = useState(false);
  const [detalle, setDetalle] = useState<Record<string, unknown> | null>(null);
  const [page, setPage] = useState(1);

  const perfil = Number(user?.perfil_postventa ?? 0);
  const esJefe = ![1, 20, 26, 46].includes(perfil);
  const esMantenimiento = perfil === 46 || perfil === 26;

  const catalogQuery = useQuery({
    queryKey: mantenimientoKeys.catalogos,
    queryFn: () => mantenimientoService.catalogos(),
    enabled: sesionLista,
    ...catalogQueryOptions,
  });

  const listQuery = useQuery({
    queryKey: mantenimientoKeys.correctivo,
    queryFn: () => mantenimientoService.listarCorrectivo(),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const bodegas = catalogQuery.data?.bodegas ?? [];
  const equipos = catalogQuery.data?.equipos ?? [];
  const rows = useMemo(() => listQuery.data ?? [], [listQuery.data]);

  async function invalidateList() {
    await queryClient.invalidateQueries({
      queryKey: mantenimientoKeys.correctivo,
    });
  }

  /** Pendientes por urgencia (urgente→moderada→leve), luego en proceso, finalizadas al final */
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ea = Number(a.estado);
      const eb = Number(b.estado);
      const group = (e: number) => (e === 3 ? 2 : e === 2 ? 1 : 0);
      const ga = group(ea);
      const gb = group(eb);
      if (ga !== gb) return ga - gb;
      const ua = Number(a.urgencia) || 0;
      const ub = Number(b.urgencia) || 0;
      if (ub !== ua) return ub - ua;
      return Number(b.id_solicitud) - Number(a.id_solicitud);
    });
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedRows.slice(start, start + PAGE_SIZE);
  }, [sortedRows, safePage]);
  const onPage = useCallback((p: number) => setPage(p), []);

  async function openDetalle(id: number) {
    try {
      setDetalle(await mantenimientoService.getSolicitud(id));
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
    }
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(
      sortedRows.map((r) => ({
        Id: r.id_solicitud,
        Codigo: r.codigo,
        Solicitud: r.solicitud,
        Estado: estadoLabel(r.estado as string, 'corr'),
        Urgencia: urgenciaLabel(r.urgencia as string),
        Sede: r.sede,
        Jefe: r.nombreJ,
        Encargado: r.nombreE,
        Inicio: r.fecha_inicio,
        Fin: r.fecha_finalizacion,
        Dias: r.dias_gest,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Correctivo');
    XLSX.writeFile(wb, 'Mantenimientos-correctivos.xlsx');
  }

  if (blocked) return null;

  return (
    <MantenimientoPageFrame title={MANTENIMIENTO_COPY.correctivo.title}>
      {listQuery.isError ? (
        <MantenimientoQueryError
          message={getErrorMessage(
            listQuery.error,
            MANTENIMIENTO_COPY.correctivo.loadError,
          )}
        />
      ) : null}

      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-4">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--color-success)]" /> Urgencia 1
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--color-warning)]" /> Urgencia 2
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-full bg-[var(--color-danger)]" /> Urgencia 3
        </span>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
        {(esJefe || perfil === 46 || perfil === 1 || perfil === 20 || perfil === 26) && (
          <button
            type="button"
            className={btnPrimaryClass}
            onClick={() => setModalNueva(true)}
          >
            Nueva Solicitud
          </button>
        )}
        {[1, 46, 20].includes(perfil) && (
          <button
            type="button"
            className={btnSuccessClass}
            onClick={exportExcel}
          >
            Descargar Excel
          </button>
        )}
      </div>

      <div className="app-section-card w-full min-w-0">
        <div className="app-table-scroll">
        <table className="w-full min-w-[1080px] text-xs md:text-sm">
          <thead className="brand-bg text-white">
            <tr>
              {[
                '#',
                'Codigo',
                'Solicitud',
                'Estado',
                'Urgencia',
                'Sede',
                'Jefe',
                'Encargado',
                'Inicio',
                'Fin',
                'Días',
                'Acciones',
              ].map((h) => (
                <th key={h} className="px-2 py-2.5 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listQuery.isFetching && rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-gray-500">
                  Sin solicitudes
                </td>
              </tr>
            ) : (
              pageRows.map((r) => {
                const id = Number(r.id_solicitud);
                const urg = Number(r.urgencia);
                const estado = Number(r.estado);
                const urgBg =
                  urg === 3
                    ? 'bg-[var(--color-danger-soft)]'
                    : urg === 2
                      ? 'bg-[var(--color-warning-soft)]'
                      : 'bg-[var(--color-success-soft)]';
                const puedeResponder =
                  esMantenimiento && (estado === 1 || estado === 2);
                return (
                  <tr key={id} className={`border-t text-center ${urgBg}`}>
                    <td className="px-2 py-2">{id}</td>
                    <td className="px-2 py-2">{String(r.codigo ?? 'N/A')}</td>
                    <td className="px-2 py-2 text-left max-w-[180px] truncate" title={String(r.solicitud ?? '')}>
                      {String(r.solicitud ?? '')}
                    </td>
                    <td className="px-2 py-2">{estadoLabel(r.estado as string, 'corr')}</td>
                    <td className="px-2 py-2">{urgenciaLabel(r.urgencia as string)}</td>
                    <td className="px-2 py-2">{String(r.sede ?? '')}</td>
                    <td className="px-2 py-2">{String(r.nombreJ ?? '')}</td>
                    <td className="px-2 py-2">{String(r.nombreE ?? '')}</td>
                    <td className="px-2 py-2">
                      {String(r.fecha_inicio ?? '').slice(0, 10)}
                    </td>
                    <td className="px-2 py-2">
                      {String(r.fecha_finalizacion ?? '').slice(0, 10)}
                    </td>
                    <td className="px-2 py-2">{String(r.dias_gest ?? '')}</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        <button
                          type="button"
                          className={`${btnIconClass} bg-[var(--color-info)]`}
                          title="Ver solicitud"
                          onClick={() => void openDetalle(id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </button>
                        {puedeResponder && (
                          <button
                            type="button"
                            className={`${btnIconClass} bg-[var(--color-warning)]`}
                            title={
                              estado === 1
                                ? 'Iniciar y asignar tiempo'
                                : 'Responder / finalizar'
                            }
                            onClick={() => void openDetalle(id)}
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            {estado === 1 ? 'Iniciar' : 'Finalizar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
        {rows.length > 0 && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-gray-600">{rows.length} registros</span>
            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onChange={onPage}
              />
            )}
          </div>
        )}
      </div>

      {modalNueva && (
        <ModalNuevaSolicitud
          bodegas={bodegas}
          equipos={equipos}
          onClose={() => setModalNueva(false)}
          onOk={async () => {
            setModalNueva(false);
            showSuccess('Solicitud creada');
            await invalidateList();
          }}
          onError={(m) => showError(m)}
        />
      )}

      {detalle && (
        <ModalDetalleSolicitud
          detalle={detalle}
          esMantenimiento={esMantenimiento}
          onClose={() => setDetalle(null)}
          onReloadDetalle={async () => {
            const id = Number(detalle.id_solicitud);
            await openDetalle(id);
            await invalidateList();
          }}
          onError={(m) => showError(m)}
          onSuccess={(m) => showSuccess(m)}
        />
      )}
    </MantenimientoPageFrame>
  );
}

function urgenciaTone(u: number | string) {
  const n = Number(u);
  if (n === 3)
    return 'border-[color-mix(in_srgb,var(--color-danger)_25%,white)] bg-[var(--color-danger-soft)] text-[var(--color-danger)]';
  if (n === 2)
    return 'border-[color-mix(in_srgb,var(--color-warning)_40%,white)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]';
  if (n === 1)
    return 'border-[color-mix(in_srgb,var(--color-success)_25%,white)] bg-[var(--color-success-soft)] text-[var(--color-success)]';
  return 'border-gray-100 bg-white text-gray-900';
}

function ModalDetalleSolicitud({
  detalle,
  esMantenimiento,
  onClose,
  onReloadDetalle,
  onError,
  onSuccess,
}: {
  detalle: Record<string, unknown>;
  esMantenimiento: boolean;
  onClose: () => void;
  onReloadDetalle: () => Promise<void>;
  onError: (m: string) => void;
  onSuccess: (m: string) => void;
}) {
  const id = Number(detalle.id_solicitud);
  const estado = Number(detalle.estado);
  const [tiempo, setTiempo] = useState('1');
  const [respuesta, setRespuesta] = useState('');
  const [fileResp, setFileResp] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleIniciar() {
    const horas = Number(tiempo);
    if (!horas || horas < 1) {
      onError('Indique el tiempo estimado en horas (mín. 1)');
      return;
    }
    setBusy(true);
    try {
      await mantenimientoService.iniciarSolicitud(id, horas);
      onSuccess('Solicitud iniciada (En proceso)');
      await onReloadDetalle();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  async function handleFinalizar() {
    if (!respuesta.trim() || respuesta.trim().length < 10) {
      onError('La respuesta debe tener al menos 10 caracteres');
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('respuesta', respuesta.trim());
      if (fileResp) form.append('file', fileResp);
      await mantenimientoService.finalizarSolicitud(id, form);
      onSuccess('Solicitud finalizada');
      await onReloadDetalle();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between brand-bg px-5 py-4 text-white">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg font-semibold">
              Solicitud #{String(detalle.id_solicitud)}
            </h2>
            <p className="text-xs text-white/80">
              {String(detalle.codigo ?? 'LOCATIVO')}
              {detalle.nombre_equipo
                ? ` — ${String(detalle.nombre_equipo)}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-white/15"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <MantenimientoInfoChip
              label="Estado"
              value={estadoLabel(detalle.estado as string, 'corr')}
            />
            <MantenimientoInfoChip
              label="Urgencia"
              value={urgenciaLabel(detalle.urgencia as string)}
              tone={urgenciaTone(detalle.urgencia as string)}
            />
            <MantenimientoInfoChip
              label="Tiempo estimado (h)"
              value={
                detalle.tiempo_estimado != null
                  ? String(detalle.tiempo_estimado)
                  : '—'
              }
            />
            <MantenimientoInfoChip label="Jefe" value={String(detalle.nombreJ ?? '—')} />
            <MantenimientoInfoChip
              label="Encargado"
              value={String(detalle.nombreE ?? '—')}
            />
            <MantenimientoInfoChip
              label="Sede"
              value={String(detalle.sede ?? '—')}
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Descripción de la solicitud
            </p>
            <p className="whitespace-pre-wrap text-sm text-gray-800">
              {String(detalle.solicitud ?? '')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <EvidenciaImg
              label="Imagen de la solicitud"
              filename={detalle.imagen as string | null}
            />
            <EvidenciaImg
              label="Evidencia de respuesta"
              filename={detalle.imagen_respuesta as string | null}
            />
          </div>

          {detalle.respuesta ? (
            <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-success)_25%,white)] bg-[var(--color-success-soft)] p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-success)]">
                Respuesta de mantenimiento
              </p>
              <p className="whitespace-pre-wrap text-sm text-gray-800">
                {String(detalle.respuesta)}
              </p>
            </div>
          ) : null}

          {/* Acciones mantenimiento — estado Pendiente */}
          {esMantenimiento && estado === 1 && (
            <div className="space-y-3 rounded-xl border border-[color-mix(in_srgb,var(--color-info)_25%,white)] bg-[color-mix(in_srgb,var(--color-info)_8%,white)] p-4">
              <p className="text-sm font-semibold text-[var(--color-info)]">
                Iniciar solicitud (pasa a En proceso)
              </p>
              <label className="block text-sm font-medium text-gray-700">
                Tiempo estimado [horas] *
                <input
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={tiempo}
                  onChange={(e) => setTiempo(e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={busy}
                className="w-full rounded-md bg-[var(--color-info)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                onClick={() => void handleIniciar()}
              >
                {busy ? 'Procesando…' : 'Iniciar'}
              </button>
            </div>
          )}

          {/* Acciones mantenimiento — En proceso */}
          {esMantenimiento && estado === 2 && (
            <div className="space-y-3 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_25%,white)] bg-[var(--color-success-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--color-success)]">
                Finalizar solicitud (pasa a Finalizada)
              </p>
              <label className="block text-sm font-medium text-gray-700">
                Respuesta / solución *
                <textarea
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={3}
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Describa la solución aplicada"
                />
              </label>
              <MantenimientoFileField
                label="Evidencia fotográfica de la respuesta"
                file={fileResp}
                accept="image/*,.pdf"
                onChange={setFileResp}
              />
              <button
                type="button"
                disabled={busy}
                className="w-full rounded-md bg-[var(--color-success)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                onClick={() => void handleFinalizar()}
              >
                {busy ? 'Procesando…' : 'Finalizar'}
              </button>
            </div>
          )}
        </div>

        <div className="border-t bg-gray-50 px-5 py-3">
          <button
            type="button"
            className={btnSecondaryClass}
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalNuevaSolicitud({
  bodegas,
  equipos,
  onClose,
  onOk,
  onError,
}: {
  bodegas: Array<{ bodega: number; descripcion: string }>;
  equipos: Array<{ id_equipo: number; codigo: string; nombre_equipo: string }>;
  onClose: () => void;
  onOk: () => void;
  onError: (m: string) => void;
}) {
  const [equipoId, setEquipoId] = useState('N/A');
  const [sede, setSede] = useState('');
  const [urgencia, setUrgencia] = useState('1');
  const [solicitud, setSolicitud] = useState('');
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    try {
      const form = new FormData();
      form.append('equipoId', equipoId);
      form.append('sedeBodega', sede);
      form.append('urgencia', urgencia);
      form.append('solicitud', solicitud);
      if (file) form.append('file', file);
      await mantenimientoService.crearSolicitud(form);
      onOk();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between brand-bg px-5 py-4 text-white">
          <h2 className="text-lg font-semibold">Nueva Solicitud</h2>
          <button
            type="button"
            className="rounded-md p-1.5 hover:bg-white/15"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <label className="block text-sm">
            Equipo
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={equipoId}
              onChange={(e) => setEquipoId(e.target.value)}
            >
              <option value="N/A">LOCATIVO</option>
              {equipos.map((e) => (
                <option key={e.id_equipo} value={String(e.id_equipo)}>
                  {e.codigo} — {e.nombre_equipo}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Sede *
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={sede}
              onChange={(e) => setSede(e.target.value)}
            >
              <option value="">Seleccione una bodega</option>
              {bodegas.map((b) => (
                <option key={b.bodega} value={String(b.bodega)}>
                  {b.descripcion}
                </option>
              ))}
            </select>
          </label>
          <div className="text-sm">
            <p className="mb-2 font-medium">Nivel de urgencia (3 = más urgente)</p>
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map((u) => (
                <label key={u} className="inline-flex items-center gap-1.5">
                  <input
                    type="radio"
                    name="urg"
                    checked={urgencia === String(u)}
                    onChange={() => setUrgencia(String(u))}
                  />
                  {u}
                </label>
              ))}
            </div>
          </div>
          <label className="block text-sm">
            Descripción *
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              rows={4}
              minLength={15}
              value={solicitud}
              onChange={(e) => setSolicitud(e.target.value)}
              placeholder="Descripción (mín. 15 caracteres)"
            />
          </label>
          <MantenimientoFileField
            label="Evidencia fotográfica"
            file={file}
            accept="image/*,.pdf"
            onChange={setFile}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t bg-gray-50 px-5 py-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={btnSecondaryClass}
            onClick={onClose}
          >
            Cerrar
          </button>
          <button
            type="button"
            className={btnSuccessClass}
            onClick={submit}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
