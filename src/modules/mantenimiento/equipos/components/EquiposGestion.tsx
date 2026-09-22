'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getXlsx } from '@/utils/export-xlsx';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Trash2, X } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { catalogQueryOptions, transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { MantenimientoPageFrame } from '@/modules/mantenimiento/components/MantenimientoPageFrame';
import { MANTENIMIENTO_COPY, PERFIL_SALUD_OCUPACIONAL } from '@/modules/mantenimiento/constants';
import { MantenimientoFileField } from '@/modules/mantenimiento/shared/components/MantenimientoFileField';
import { MantenimientoQueryError } from '@/modules/mantenimiento/shared/components/MantenimientoQueryError';
import { mantenimientoKeys } from '@/modules/mantenimiento/shared/constants/query-keys';
import {
  btnDangerClass,
  btnIconClass,
  btnInfoClass,
  btnPrimaryClass,
  btnSecondaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/mantenimiento/shared/constants/ui';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { mantenimientoService } from '@/modules/mantenimiento/shared/services/mantenimiento.service';
import { getErrorMessage } from '@/modules/mantenimiento/shared/utils/parse-api-error';
import {
  AREAS_FILTRO,
  AREAS_LETRA,
  BODEGAS_FILTRO_EQUIPOS,
  BODEGAS_LETRA,
} from '@/modules/mantenimiento/shared/constants/labels';
import { EQUIPOS_MANTENIMIENTO_SUBMENU_ID } from '@/utils/constants';
import {
  emptyHojaVidaForm,
  HojaVidaFormFields,
  type HojaVidaFormState,
} from './HojaVidaFormFields';
import { appendHojaVidaToForm, errorPeriodosMtto } from '../utils/hoja-vida';
import {
  FILTROS_EQUIPOS_INICIAL,
  guardarFiltrosEquipos,
  leerFiltrosEquipos,
  limpiarFiltrosEquipos,
  type FiltrosEquipos,
} from '../utils/filtros-equipos';

type Equipo = {
  id_equipo: number;
  codigo: string;
  nombre_equipo: string;
  bodega: string;
  area: string;
  estado: string;
  alias_equipo: string | null;
  cv_equipo: string | null;
};

export function EquiposGestion() {
  const { blocked, user } = useMantenimientoPageGuard(
    EQUIPOS_MANTENIMIENTO_SUBMENU_ID,
  );
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;
  const soloConsulta = Number(user?.perfil_postventa) === PERFIL_SALUD_OCUPACIONAL;
  const [page, setPage] = useState(() => leerFiltrosEquipos().page);
  const [limit, setLimit] = useState(() => leerFiltrosEquipos().limit);
  const [filter, setFilter] = useState(() => leerFiltrosEquipos().filter);
  const [bodega, setBodega] = useState(() => leerFiltrosEquipos().bodega);
  const [area, setArea] = useState(() => leerFiltrosEquipos().area);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalRetiro, setModalRetiro] = useState<Equipo | null>(null);

  function persistirFiltros(parcial: Partial<FiltrosEquipos>) {
    guardarFiltrosEquipos({
      page,
      limit,
      filter,
      bodega,
      area,
      ...parcial,
    });
  }

  const catalogQuery = useQuery({
    queryKey: mantenimientoKeys.catalogos,
    queryFn: () => mantenimientoService.catalogos(),
    enabled: sesionLista,
    ...catalogQueryOptions,
  });

  const listQuery = useQuery({
    queryKey: mantenimientoKeys.equipos({
      page,
      limit,
      filter,
      bodega,
      area,
    }),
    queryFn: () =>
      mantenimientoService.listarEquipos({
        page,
        limit,
        filter: filter || undefined,
        bodega: bodega || undefined,
        area: area || undefined,
      }),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const rows = (listQuery.data?.data ?? []) as unknown as Equipo[];
  const total = listQuery.data?.total ?? 0;
  const loading = listQuery.isFetching;
  const familias = catalogQuery.data?.familias ?? [];
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showInitialLoading = loading && rows.length === 0;

  async function exportExcel() {
    const XLSX = await getXlsx();
    const ws = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Codigo: r.codigo,
        Equipo: r.nombre_equipo,
        Alias: r.alias_equipo,
        Bodega: r.bodega,
        Area: r.area,
        Estado: r.estado,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Equipos');
    XLSX.writeFile(wb, 'Equipos-Mantenimiento.xlsx');
  }

  if (blocked) return null;

  return (
    <MantenimientoPageFrame title={MANTENIMIENTO_COPY.equipos.title}>
      <div className="app-section-card w-full min-w-0">
        <div className="app-form-grid-3 items-end">
          <select
            className={`${inputClass} mt-0`}
            value={bodega}
            onChange={(e) => {
              const value = e.target.value;
              setBodega(value);
              setPage(1);
              persistirFiltros({ bodega: value, page: 1 });
            }}
            aria-label="Bodega"
          >
            <option value="">Bodega</option>
            {BODEGAS_FILTRO_EQUIPOS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
          <select
            className={`${inputClass} mt-0`}
            value={area}
            onChange={(e) => {
              const value = e.target.value;
              setArea(value);
              setPage(1);
              persistirFiltros({ area: value, page: 1 });
            }}
            aria-label="Área"
          >
            <option value="">Área</option>
            {AREAS_FILTRO.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={btnSecondaryClass}
            onClick={() => {
              limpiarFiltrosEquipos();
              setBodega(FILTROS_EQUIPOS_INICIAL.bodega);
              setArea(FILTROS_EQUIPOS_INICIAL.area);
              setFilter(FILTROS_EQUIPOS_INICIAL.filter);
              setPage(FILTROS_EQUIPOS_INICIAL.page);
              guardarFiltrosEquipos({
                ...FILTROS_EQUIPOS_INICIAL,
                limit,
              });
            }}
          >
            Restablecer
          </button>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <select
            className={`${inputClass} mt-0 w-full sm:w-auto`}
            value={limit}
            onChange={(e) => {
              const value = Number(e.target.value);
              setLimit(value);
              setPage(1);
              persistirFiltros({ limit: value, page: 1 });
            }}
            aria-label="Registros por página"
          >
            {[10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} por página
              </option>
            ))}
          </select>
          <input
            id="mtto-equipos-search"
            data-testid="mtto-equipos-search"
            className={`${inputClass} mt-0 w-full sm:min-w-[12rem]`}
            placeholder="Buscar..."
            aria-label="Buscar equipos"
            value={filter}
            onChange={(e) => {
              const value = e.target.value;
              setFilter(value);
              setPage(1);
              persistirFiltros({ filter: value, page: 1 });
            }}
          />
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href="/dashboard/mantenimiento/equipos/informes"
            className={btnInfoClass}
          >
            Informes
          </Link>
          {soloConsulta ? null : (
            <button
              type="button"
              className={btnPrimaryClass}
              onClick={() => setModalNuevo(true)}
            >
              Nuevo Equipo
            </button>
          )}
          <button
            type="button"
            className={btnSuccessClass}
            onClick={exportExcel}
          >
            Descargar Excel
          </button>
        </div>
      </div>

      {listQuery.isError ? (
        <MantenimientoQueryError
          message={getErrorMessage(
            listQuery.error,
            MANTENIMIENTO_COPY.equipos.loadError,
          )}
        />
      ) : null}

      <div className="app-section-card w-full min-w-0">
        <div data-testid="mtto-equipos-table" className="app-table-scroll">
        <table
          className={`w-full min-w-[860px] text-sm transition-opacity ${
            loading && rows.length > 0 ? 'opacity-70' : 'opacity-100'
          }`}
        >
          <thead className="brand-bg text-white">
            <tr>
              {(soloConsulta
                ? ['Codigo', 'Familia/Equipo', 'Bodega', 'Area', 'Estado', 'Hoja de vida']
                : ['Codigo', 'Familia/Equipo', 'Bodega', 'Area', 'Estado', 'Hoja de vida', 'Retirar']
              ).map((h) => (
                <th key={h} className="px-2 py-2 text-center">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {showInitialLoading ? (
              <tr>
                <td colSpan={soloConsulta ? 6 : 7} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={soloConsulta ? 6 : 7} className="py-8 text-center text-gray-500">
                  Sin equipos
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id_equipo} className="border-t text-center">
                  <td className="px-2 py-2">{r.codigo}</td>
                  <td className="px-2 py-2 text-left">
                    {r.alias_equipo || r.nombre_equipo}
                    <div className="text-xs text-gray-500">{r.nombre_equipo}</div>
                  </td>
                  <td className="px-2 py-2 text-left">{r.bodega}</td>
                  <td className="px-2 py-2 text-left">{r.area}</td>
                  <td className="px-2 py-2">{r.estado}</td>
                  <td className="px-2 py-2">
                    <Link
                      href={`/dashboard/mantenimiento/equipos/${r.id_equipo}`}
                      className={`${btnIconClass} bg-[var(--color-info)]`}
                      title={soloConsulta ? 'Hoja de vida e historial' : 'Hoja de vida, historial y editar'}
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      Hoja de vida
                    </Link>
                  </td>
                  {soloConsulta ? null : (
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        className={`${btnIconClass} bg-[var(--color-danger)]`}
                        title="Retirar equipo"
                        onClick={() => setModalRetiro(r)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Retirar
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        <div className="mt-3 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <span>{total} registros</span>
          {totalPages > 1 && (
            <Pagination
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              onChange={(next) => {
                setPage(next);
                persistirFiltros({ page: next });
              }}
            />
          )}
        </div>
      </div>

      {modalNuevo && (
        <ModalNuevoEquipo
          familias={familias}
          onClose={() => setModalNuevo(false)}
          onOk={async () => {
            setModalNuevo(false);
            showSuccess('Equipo creado');
            await queryClient.invalidateQueries({
              queryKey: mantenimientoKeys.all,
            });
          }}
          onError={(m) => showError(m)}
        />
      )}

      {modalRetiro && (
        <ModalRetiro
          equipo={modalRetiro}
          onClose={() => setModalRetiro(null)}
          onOk={async () => {
            setModalRetiro(null);
            showSuccess('Equipo retirado');
            await queryClient.invalidateQueries({
              queryKey: mantenimientoKeys.all,
            });
          }}
          onError={(m) => showError(m)}
        />
      )}
    </MantenimientoPageFrame>
  );
}

function ModalNuevoEquipo({
  familias,
  onClose,
  onOk,
  onError,
}: {
  familias: Array<{ codigo: string; nombre: string }>;
  onClose: () => void;
  onOk: () => void;
  onError: (m: string) => void;
}) {
  const [alias, setAlias] = useState('');
  const [fam, setFam] = useState('');
  const [nom, setNom] = useState('');
  const [bod, setBod] = useState('');
  const [area, setArea] = useState('');
  const [hoja, setHoja] = useState<HojaVidaFormState>(emptyHojaVidaForm);
  const [saving, setSaving] = useState(false);
  const nombresQuery = useQuery({
    queryKey: mantenimientoKeys.nombresFamilia(fam),
    queryFn: () => mantenimientoService.nombresFamilia(fam),
    enabled: Boolean(fam),
    ...catalogQueryOptions,
  });
  const nombres = nombresQuery.data ?? [];

  const codigoE = `${nom}${bod}${area}`;

  async function submit() {
    if (!alias || !fam || !nom || !bod || !area) {
      onError('Complete alias, familia, nombre, bodega y área');
      return;
    }
    const errPeriodos = errorPeriodosMtto(hoja.periodos_mtto);
    if (errPeriodos) {
      onError(errPeriodos);
      return;
    }
    setSaving(true);
    try {
      const form = new FormData();
      form.append('aliasEquipo', alias);
      form.append('nombreEquipo', fam);
      form.append('nombreEquipo2', nom);
      form.append('nombreBodega', bod);
      form.append('nombrearea', area);
      form.append('codigoE', codigoE);
      appendHojaVidaToForm(form, hoja);
      await mantenimientoService.crearEquipo(form);
      onOk();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-[1px] sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
        <div className="flex items-center justify-between brand-bg px-5 py-4 text-white">
          <h2 className="text-lg font-semibold">Registro de nuevo equipo</h2>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm sm:col-span-2"
              placeholder="Alias *"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={fam}
              onChange={(e) => setFam(e.target.value)}
            >
              <option value="">Familia *</option>
              {familias.map((f) => (
                <option key={f.codigo} value={f.codigo}>
                  {f.nombre}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            >
              <option value="">Nombre equipo *</option>
              {nombres.map((n) => (
                <option key={n.codigo_equipo} value={n.codigo_equipo}>
                  {n.nombre_equipo}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={bod}
              onChange={(e) => setBod(e.target.value)}
            >
              <option value="">Bodega *</option>
              {BODEGAS_LETRA.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              <option value="">Área *</option>
              {AREAS_LETRA.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm sm:col-span-2"
              readOnly
              value={codigoE || 'Código (auto)'}
            />
          </div>
          <HojaVidaFormFields
            value={hoja}
            onChange={(patch) => setHoja((prev) => ({ ...prev, ...patch }))}
          />
        </div>
        <div className="flex flex-col-reverse gap-2 border-t bg-gray-50 px-5 py-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={btnSecondaryClass}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            className={`${btnSuccessClass} disabled:opacity-50`}
            onClick={() => void submit()}
          >
            {saving ? 'Guardando…' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalRetiro({
  equipo,
  onClose,
  onOk,
  onError,
}: {
  equipo: Equipo;
  onClose: () => void;
  onOk: () => void;
  onError: (m: string) => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function submit() {
    if (!motivo.trim() || !file) {
      onError('Complete motivo e imagen');
      return;
    }
    setEnviando(true);
    try {
      const form = new FormData();
      form.append('motivo_solicitud', motivo);
      form.append('file', file);
      await mantenimientoService.retiro(equipo.id_equipo, form);
      onOk();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md space-y-3 rounded-t-2xl bg-white p-4 sm:rounded-xl">
        <h2 className="text-center font-semibold break-words">Retirar equipo — {equipo.codigo}</h2>
        <textarea className="w-full rounded border px-3 py-2 text-sm" rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo" />
        <MantenimientoFileField
          label="Imagen del retiro *"
          file={file}
          accept="image/*,.pdf"
          onChange={setFile}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className={btnSecondaryClass} onClick={onClose} disabled={enviando}>Cancelar</button>
          <button type="button" className={btnDangerClass} onClick={submit} disabled={enviando}>
            {enviando ? 'Retirando…' : 'Retirar'}
          </button>
        </div>
      </div>
    </div>
  );
}
