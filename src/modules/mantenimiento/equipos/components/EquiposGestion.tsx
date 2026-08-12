'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { ClipboardList, Trash2, Upload, Wrench, X } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { mantenimientoService } from '@/modules/mantenimiento/shared/services/mantenimiento.service';
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
import { appendHojaVidaToForm } from '../utils/hoja-vida';

const btnBase =
  'inline-flex items-center justify-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40';

function FileField({
  label,
  file,
  accept,
  onChange,
}: {
  label: string;
  file: File | null;
  accept?: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 transition-colors hover:border-amber-400 hover:bg-amber-50/40">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--color-primary) text-white">
          <Upload className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-gray-800">
            {file ? 'Archivo seleccionado' : 'Seleccionar archivo'}
          </span>
          <span className="block truncate text-xs text-gray-500">
            {file ? file.name : 'Haz clic para buscar en tu equipo'}
          </span>
        </span>
        <input
          type="file"
          className="sr-only"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

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
  const { blocked } = useMantenimientoPageGuard(EQUIPOS_MANTENIMIENTO_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('');
  const [bodega, setBodega] = useState('');
  const [area, setArea] = useState('');
  const [rows, setRows] = useState<Equipo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [familias, setFamilias] = useState<Array<{ codigo: string; nombre: string }>>([]);
  const [jefes, setJefes] = useState<Array<{ nit: string; nombres: string }>>([]);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalOt, setModalOt] = useState<Equipo | null>(null);
  const [modalRetiro, setModalRetiro] = useState<Equipo | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await mantenimientoService.listarEquipos({
        page,
        limit,
        filter: filter || undefined,
        bodega: bodega || undefined,
        area: area || undefined,
      });
      setRows(res.data as unknown as Equipo[]);
      setTotal(res.total);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
    // showError omitido a propósito: evita recrear load y refetch innecesario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filter, bodega, area]);

  useEffect(() => {
    if (blocked) return;
    mantenimientoService.catalogos().then((c) => {
      setFamilias(c.familias);
      setJefes(c.jefes);
    });
  }, [blocked]);

  useEffect(() => {
    if (blocked) return;
    void load();
  }, [blocked, load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showInitialLoading = loading && rows.length === 0;

  function exportExcel() {
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
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="app-title-xl brand-text">Gestión de Equipos y Mantenimiento</h1>
        <Link href="/dashboard/mantenimiento" className="text-sm text-amber-700 hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <select
          className="rounded border px-3 py-2 text-sm"
          value={bodega}
          onChange={(e) => {
            setBodega(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Bodega</option>
          {BODEGAS_FILTRO_EQUIPOS.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
        <select
          className="rounded border px-3 py-2 text-sm"
          value={area}
          onChange={(e) => {
            setArea(e.target.value);
            setPage(1);
          }}
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
          className="rounded border px-3 py-2 text-sm"
          onClick={() => {
            setBodega('');
            setArea('');
            setFilter('');
            setPage(1);
          }}
        >
          Restablecer
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded border px-2 py-2 text-sm"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} por página
              </option>
            ))}
          </select>
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Buscar..."
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setModalNuevo(true)}
          >
            Nuevo Equipo
          </button>
          <button
            type="button"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={exportExcel}
          >
            Descargar Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm">
        <table
          className={`min-w-full text-sm transition-opacity ${
            loading && rows.length > 0 ? 'opacity-70' : 'opacity-100'
          }`}
        >
          <thead className="bg-(--color-primary) text-white">
            <tr>
              {['Codigo', 'Familia/Equipo', 'Bodega', 'Area', 'Estado', 'Mtto', 'Hoja de vida', 'Retirar'].map(
                (h) => (
                  <th key={h} className="px-2 py-2 text-center">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {showInitialLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-500">
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
                    <button
                      type="button"
                      className={`${btnBase} bg-amber-600`}
                      title="Orden de mantenimiento preventivo"
                      onClick={() => setModalOt(r)}
                    >
                      <Wrench className="h-3.5 w-3.5" />
                      Mtto
                    </button>
                  </td>
                  <td className="px-2 py-2">
                    <Link
                      href={`/dashboard/mantenimiento/equipos/${r.id_equipo}`}
                      className={`${btnBase} bg-sky-600`}
                      title="Hoja de vida, historial y editar"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      Hoja de vida
                    </Link>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      className={`${btnBase} bg-red-600`}
                      title="Solicitar retiro"
                      onClick={() => setModalRetiro(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Retirar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-3 flex justify-between text-sm text-gray-600">
          <span>{total} registros</span>
          {totalPages > 1 && (
            <Pagination currentPage={Math.min(page, totalPages)} totalPages={totalPages} onChange={setPage} />
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
            await load();
          }}
          onError={(m) => showError(m)}
        />
      )}

      {modalOt && (
        <ModalOt
          equipo={modalOt}
          onClose={() => setModalOt(null)}
          onOk={async () => {
            setModalOt(null);
            showSuccess('OT preventivo creada');
          }}
          onError={(m) => showError(m)}
        />
      )}

      {modalRetiro && (
        <ModalRetiro
          equipo={modalRetiro}
          jefes={jefes}
          onClose={() => setModalRetiro(null)}
          onOk={async () => {
            setModalRetiro(null);
            showSuccess('Solicitud de retiro enviada');
          }}
          onError={(m) => showError(m)}
        />
      )}
    </div>
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
  const [nombres, setNombres] = useState<
    Array<{ codigo_equipo: string; nombre_equipo: string }>
  >([]);
  const [nom, setNom] = useState('');
  const [bod, setBod] = useState('');
  const [area, setArea] = useState('');
  const [hoja, setHoja] = useState<HojaVidaFormState>(emptyHojaVidaForm);
  const [saving, setSaving] = useState(false);

  const codigoE = `${nom}${bod}${area}`;

  useEffect(() => {
    if (!fam) {
      setNombres([]);
      return;
    }
    mantenimientoService
      .nombresFamilia(fam)
      .then(setNombres)
      .catch(() => setNombres([]));
  }, [fam]);

  async function submit() {
    if (!alias || !fam || !nom || !bod || !area) {
      onError('Complete alias, familia, nombre, bodega y área');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between bg-(--color-primary) px-5 py-4 text-white">
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
        <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-3">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            onClick={() => void submit()}
          >
            {saving ? 'Guardando…' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalOt({
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
  const [fecha, setFecha] = useState('');
  const [tiempo, setTiempo] = useState('1');
  const [desc, setDesc] = useState('');

  async function submit() {
    try {
      await mantenimientoService.ordenPreventivo(equipo.id_equipo, {
        codigoEquipoMp: equipo.codigo,
        f_requerida: fecha,
        tiempo_estimado: Number(tiempo),
        descripcionMp: desc,
      });
      onOk();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 space-y-3">
        <h2 className="text-center font-semibold">Orden de Mantenimiento Preventivo</h2>
        <input className="w-full rounded border px-3 py-2 text-sm bg-gray-50" readOnly value={equipo.codigo} />
        <input className="w-full rounded border px-3 py-2 text-sm bg-gray-50" readOnly value={equipo.nombre_equipo} />
        <input type="date" className="w-full rounded border px-3 py-2 text-sm" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <input type="number" min={1} className="w-full rounded border px-3 py-2 text-sm" value={tiempo} onChange={(e) => setTiempo(e.target.value)} placeholder="Horas" />
        <textarea className="w-full rounded border px-3 py-2 text-sm" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción" />
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded border px-3 py-2 text-sm" onClick={onClose}>Cancelar</button>
          <button type="button" className="rounded bg-emerald-600 px-3 py-2 text-sm text-white" onClick={submit}>Agregar</button>
        </div>
      </div>
    </div>
  );
}

function ModalRetiro({
  equipo,
  jefes,
  onClose,
  onOk,
  onError,
}: {
  equipo: Equipo;
  jefes: Array<{ nit: string; nombres: string }>;
  onClose: () => void;
  onOk: () => void;
  onError: (m: string) => void;
}) {
  const [jefe, setJefe] = useState(jefes[0]?.nit ?? '');
  const [motivo, setMotivo] = useState('');
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    if (!motivo || !file || !jefe) {
      onError('Complete jefe, motivo e imagen');
      return;
    }
    try {
      const form = new FormData();
      form.append('jefe', jefe);
      form.append('motivo_solicitud', motivo);
      form.append('file', file);
      await mantenimientoService.retiro(equipo.id_equipo, form);
      onOk();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-4 space-y-3">
        <h2 className="text-center font-semibold">Solicitud retiro — {equipo.codigo}</h2>
        <select className="w-full rounded border px-3 py-2 text-sm" value={jefe} onChange={(e) => setJefe(e.target.value)}>
          {jefes.map((j) => (
            <option key={j.nit} value={j.nit}>{j.nombres}</option>
          ))}
        </select>
        <textarea className="w-full rounded border px-3 py-2 text-sm" rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo" />
        <FileField
          label="Imagen del retiro *"
          file={file}
          accept="image/*,.pdf"
          onChange={setFile}
        />
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded border px-3 py-2 text-sm" onClick={onClose}>Cancelar</button>
          <button type="button" className="rounded bg-red-600 px-3 py-2 text-sm text-white" onClick={submit}>Retirar</button>
        </div>
      </div>
    </div>
  );
}
