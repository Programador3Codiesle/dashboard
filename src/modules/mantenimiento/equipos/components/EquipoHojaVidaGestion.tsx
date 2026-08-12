'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ExternalLink,
  MapPin,
  Pencil,
  Phone,
  Wrench,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { mantenimientoService } from '@/modules/mantenimiento/shared/services/mantenimiento.service';
import { estadoLabel } from '@/modules/mantenimiento/shared/constants/labels';
import { EQUIPOS_MANTENIMIENTO_SUBMENU_ID } from '@/utils/constants';
import { getApiPublicUrl } from '@/config/public-env';
import {
  emptyHojaVidaForm,
  HojaVidaFormFields,
  type HojaVidaFormState,
} from './HojaVidaFormFields';
import { appendHojaVidaToForm, emptyTecnicos, emptyHidraulicos } from '../utils/hoja-vida';

function imgUrl(name: string | null | undefined) {
  if (!name) return null;
  return `${getApiPublicUrl()}/mantenimiento/cv_equipos/${encodeURIComponent(name)}`;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 border-b border-gray-100 py-1.5 text-sm last:border-0">
      <span className="w-28 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className="min-w-0 flex-1 font-medium text-gray-900">{value}</span>
    </div>
  );
}

function SpecGrid({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: 'sky' | 'emerald';
  rows: Array<[string, string | null | undefined]>;
}) {
  const filled = rows.filter(([, v]) => v);
  if (!filled.length) return null;
  const wrap =
    tone === 'sky'
      ? 'border-sky-200/80 bg-sky-50/50'
      : 'border-emerald-200/80 bg-emerald-50/50';
  const titleCls = tone === 'sky' ? 'text-sky-900' : 'text-emerald-900';
  return (
    <section className={`rounded-xl border ${wrap} p-3.5`}>
      <h3 className={`mb-2 text-xs font-bold uppercase tracking-wider ${titleCls}`}>
        {title}
      </h3>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
        {filled.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              {k}
            </dt>
            <dd className="truncate text-sm font-semibold text-gray-900" title={String(v)}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ListaCompacta({
  title,
  items,
  cols = 1,
}: {
  title: string;
  items: Array<{ orden: number; texto: string }>;
  cols?: 1 | 2;
}) {
  if (!items.length) return null;
  return (
    <section className="rounded-xl border border-gray-200/80 bg-white p-3.5">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
        {title}
      </h3>
      <ol
        className={`list-decimal space-y-1.5 pl-4 text-[13px] leading-snug text-gray-800 ${
          cols === 2 ? 'sm:columns-2 sm:gap-x-6 sm:space-y-0 sm:[column-fill:balance]' : ''
        }`}
      >
        {items.map((it) => (
          <li
            key={it.orden}
            className={`whitespace-pre-wrap ${cols === 2 ? 'mb-1.5 break-inside-avoid' : ''}`}
          >
            {it.texto}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function EquipoHojaVidaGestion() {
  const params = useParams();
  const id = Number(params?.id);
  const { blocked } = useMantenimientoPageGuard(EQUIPOS_MANTENIMIENTO_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Awaited<
    ReturnType<typeof mantenimientoService.getHojaVida>
  > | null>(null);
  const [hoja, setHoja] = useState<HojaVidaFormState>(emptyHojaVidaForm);
  const [nombre, setNombre] = useState('');
  const [alias, setAlias] = useState('');
  const [bodega, setBodega] = useState('');
  const [area, setArea] = useState('');
  const [estado, setEstado] = useState('');
  const [codigo, setCodigo] = useState('');

  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) return;
    setLoading(true);
    try {
      const res = await mantenimientoService.getHojaVida(id);
      setData(res);
      const eq = res.equipo;
      setNombre(String(eq.nombre_equipo ?? ''));
      setAlias(String(eq.alias_equipo ?? ''));
      setBodega(String(eq.bodega ?? ''));
      setArea(String(eq.area ?? ''));
      setEstado(String(eq.estado ?? ''));
      setCodigo(String(eq.codigo ?? ''));
      const tec = res.tecnicos;
      const hid = res.hidraulicos;
      setHoja({
        fabricante: String(eq.fabricante ?? ''),
        modelo: String(eq.modelo ?? ''),
        marca: String(eq.marca ?? ''),
        ubicacion: String(eq.ubicacion ?? ''),
        sector: String(eq.sector ?? ''),
        descripcion: String(eq.descripcion ?? ''),
        periodo_mtto_preventivo: String(eq.periodo_mtto_preventivo ?? ''),
        dist_nombre: String(eq.dist_nombre ?? ''),
        dist_direccion: String(eq.dist_direccion ?? ''),
        dist_telefono: String(eq.dist_telefono ?? ''),
        dist_ciudad: String(eq.dist_ciudad ?? ''),
        dist_departamento: String(eq.dist_departamento ?? ''),
        dist_redes_sociales: String(eq.dist_redes_sociales ?? ''),
        tiene_tecnicos: Boolean(tec),
        tiene_hidraulicos: Boolean(hid),
        tecnicos: tec
          ? {
              alimentacion: String(tec.alimentacion ?? ''),
              frecuencia_alimentacion: String(tec.frecuencia_alimentacion ?? ''),
              anio_fabricacion: String(tec.anio_fabricacion ?? ''),
              numero_serie: String(tec.numero_serie ?? ''),
              potencia_consumo: String(tec.potencia_consumo ?? ''),
              peso: String(tec.peso ?? ''),
              revolucion: String(tec.revolucion ?? ''),
            }
          : emptyTecnicos(),
        hidraulicos: hid
          ? {
              capacidad_litros: String(hid.capacidad_litros ?? ''),
              capacidad_carga_tn: String(hid.capacidad_carga_tn ?? ''),
              tipo_aceite: String(hid.tipo_aceite ?? ''),
              capacidad_maxima_carga: String(hid.capacidad_maxima_carga ?? ''),
            }
          : emptyHidraulicos(),
        elementos: res.elementos.map((e) => e.texto),
        recomendaciones: res.recomendaciones.map((e) => e.texto),
        mtto_operativo: res.mtto_operativo.map((e) => e.texto),
        file: null,
      });
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    if (blocked) return;
    void load();
  }, [blocked, load]);

  async function guardar() {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('nombre_equipo', nombre);
      form.append('alias_equipo', alias);
      form.append('bodega', bodega);
      form.append('area', area);
      form.append('estado', estado);
      form.append('codigo', codigo);
      appendHojaVidaToForm(form, hoja);
      await mantenimientoService.updateHojaVida(id, form);
      showSuccess('Hoja de vida actualizada');
      setEditing(false);
      await load();
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  if (blocked) return null;
  if (loading) {
    return <p className="py-10 text-center text-sm text-gray-500">Cargando hoja de vida…</p>;
  }
  if (!data) {
    return <p className="py-10 text-center text-sm text-gray-500">Equipo no encontrado</p>;
  }

  const eq = data.equipo;
  const foto =
    imgUrl(String(eq.imagen_equipo ?? '')) ||
    imgUrl(String(eq.cv_equipo ?? ''));
  const periodo = String(eq.periodo_mtto_preventivo ?? '');
  const tieneDist = Boolean(
    eq.dist_nombre || eq.dist_telefono || eq.dist_direccion,
  );
  const estadoStr = String(eq.estado ?? '');
  const estadoTone =
    estadoStr.toLowerCase() === 'activo'
      ? 'bg-emerald-100 text-emerald-800'
      : estadoStr.toLowerCase().includes('repar')
        ? 'bg-amber-100 text-amber-800'
        : 'bg-gray-100 text-gray-700';

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/dashboard/mantenimiento/equipos"
            className="text-xs font-medium text-amber-700 hover:underline"
          >
            ← Volver a equipos
          </Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h1 className="app-title-xl brand-text truncate">
              {String(eq.alias_equipo || eq.nombre_equipo)}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${estadoTone}`}
            >
              {estadoStr}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Ficha técnica · Inventario {String(eq.codigo)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {!editing ? (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-(--color-primary) px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </button>
          ) : (
            <>
              <button
                type="button"
                className="rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setEditing(false);
                  void load();
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={saving}
                className="rounded-md bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                onClick={() => void guardar()}
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre equipo"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Alias"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={bodega}
              onChange={(e) => setBodega(e.target.value)}
              placeholder="Bodega"
            />
            <input
              className="rounded-lg border px-3 py-2 text-sm"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Área"
            />
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="Activo">Activo</option>
              <option value="Reparacion">Reparacion</option>
              <option value="inactivo">inactivo</option>
            </select>
          </div>
          <HojaVidaFormFields
            value={hoja}
            onChange={(patch) => setHoja((p) => ({ ...p, ...patch }))}
          />
        </div>
      ) : (
        <>
          {/* Cabecera ficha */}
          <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
            <div className="h-1 brand-bg" />
            <div className="grid gap-0 md:grid-cols-[200px_1fr]">
              <div className="relative aspect-4/3 bg-linear-to-br from-stone-100 to-stone-200 md:aspect-auto md:min-h-full">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={foto}
                    alt={String(eq.nombre_equipo)}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-[140px] items-center justify-center text-xs text-gray-500">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex flex-col p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-(--color-primary)">
                      Equipo
                    </p>
                    <h2 className="text-xl font-semibold leading-tight text-gray-900 sm:text-2xl">
                      {String(eq.nombre_equipo)}
                    </h2>
                    {eq.alias_equipo ? (
                      <p className="text-sm text-gray-500">{String(eq.alias_equipo)}</p>
                    ) : null}
                  </div>
                  {periodo ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
                      <Wrench className="h-3 w-3" />
                      Mtto {periodo}
                    </span>
                  ) : null}
                </div>

                <div className="grid gap-x-6 sm:grid-cols-2">
                  <div>
                    <MetaRow label="Fabricante" value={String(eq.fabricante ?? '')} />
                    <MetaRow label="Marca" value={String(eq.marca ?? '')} />
                    <MetaRow label="Modelo" value={String(eq.modelo ?? '')} />
                    <MetaRow label="Código" value={String(eq.codigo ?? '')} />
                  </div>
                  <div>
                    <MetaRow
                      label="Ubicación"
                      value={String(eq.ubicacion ?? eq.bodega ?? '')}
                    />
                    <MetaRow
                      label="Sector"
                      value={String(eq.sector ?? eq.area ?? '')}
                    />
                    <MetaRow label="Periodo" value={periodo || 'No aplica'} />
                  </div>
                </div>

                {eq.cv_equipo && !eq.imagen_equipo ? (
                  <a
                    href={imgUrl(String(eq.cv_equipo))!}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Ver CV archivo legacy
                  </a>
                ) : null}

                {eq.descripcion ? (
                  <p className="mt-3 border-t border-gray-100 pt-3 text-[13px] leading-relaxed text-gray-700">
                    {String(eq.descripcion)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Specs */}
          {(data.tecnicos || data.hidraulicos) && (
            <div
              className={`grid gap-3 ${
                data.tecnicos && data.hidraulicos ? 'lg:grid-cols-2' : ''
              }`}
            >
              {data.tecnicos && (
                <SpecGrid
                  title="Datos técnicos"
                  tone="sky"
                  rows={[
                    ['Alimentación', data.tecnicos.alimentacion],
                    ['Frecuencia', data.tecnicos.frecuencia_alimentacion],
                    ['Año fab.', data.tecnicos.anio_fabricacion],
                    ['Nº serie', data.tecnicos.numero_serie],
                    ['Potencia', data.tecnicos.potencia_consumo],
                    ['Peso', data.tecnicos.peso],
                    ['Revolución', data.tecnicos.revolucion],
                  ]}
                />
              )}
              {data.hidraulicos && (
                <SpecGrid
                  title="Datos hidráulicos"
                  tone="emerald"
                  rows={[
                    ['Cap. litros', data.hidraulicos.capacidad_litros],
                    ['Carga (tn)', data.hidraulicos.capacidad_carga_tn],
                    ['Tipo aceite', data.hidraulicos.tipo_aceite],
                    ['Carga máx.', data.hidraulicos.capacidad_maxima_carga],
                  ]}
                />
              )}
            </div>
          )}

          {/* Listas + distribuidor */}
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <ListaCompacta
                title="Elementos del equipo"
                items={data.elementos}
                cols={2}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <ListaCompacta
                  title="Recomendaciones de uso"
                  items={data.recomendaciones}
                />
                <ListaCompacta
                  title="Mantenimiento operativo"
                  items={data.mtto_operativo}
                />
              </div>
            </div>

            {tieneDist ? (
              <aside className="rounded-xl border border-gray-200/80 bg-linear-to-b from-white to-stone-50 p-3.5">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  Distribuidor
                </h3>
                {eq.dist_nombre ? (
                  <p className="text-sm font-semibold text-gray-900">
                    {String(eq.dist_nombre)}
                  </p>
                ) : null}
                <div className="mt-2 space-y-1.5 text-[13px] text-gray-700">
                  {eq.dist_direccion ? (
                    <p className="flex gap-1.5">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{String(eq.dist_direccion)}</span>
                    </p>
                  ) : null}
                  {eq.dist_telefono ? (
                    <p className="flex gap-1.5">
                      <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span>{String(eq.dist_telefono)}</span>
                    </p>
                  ) : null}
                  {[eq.dist_ciudad, eq.dist_departamento].some(Boolean) ? (
                    <p className="pl-5 text-gray-600">
                      {[eq.dist_ciudad, eq.dist_departamento]
                        .filter(Boolean)
                        .join(' – ')}
                    </p>
                  ) : null}
                  {eq.dist_redes_sociales ? (
                    <a
                      href={String(eq.dist_redes_sociales)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 break-all pl-5 text-sky-700 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      Redes
                    </a>
                  ) : null}
                </div>
              </aside>
            ) : null}
          </div>

          {/* Historial */}
          <section className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-stone-50/80 px-3.5 py-2.5">
              <h3 className="text-sm font-semibold text-gray-900">
                Historial de mantenimiento
              </h3>
              <p className="text-[11px] text-gray-500">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-400" />
                Preventivo
                <span className="mx-2 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Correctivo
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-[10px] uppercase tracking-wide text-gray-500">
                    {[
                      'Tipo',
                      'Estado',
                      'Descripción',
                      'Solicitud',
                      'Requerida',
                      'Inicio',
                      'Fin',
                      'Asignado',
                    ].map((h) => (
                      <th key={h} className="px-3 py-2 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.historial.preventivo.length === 0 &&
                  data.historial.correctivo.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-5 text-center text-gray-500">
                        Sin historial
                      </td>
                    </tr>
                  ) : (
                    <>
                      {data.historial.preventivo.map((h, i) => (
                        <tr
                          key={`p-${i}`}
                          className="border-t border-amber-100/80 bg-amber-50/60 align-top"
                        >
                          <td className="px-3 py-2 font-medium whitespace-nowrap">
                            Preventivo
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {estadoLabel(h.estadoMto as string, 'prev')}
                          </td>
                          <td className="max-w-[280px] px-3 py-2 text-[12px] leading-snug text-gray-800">
                            {String(h.descrip ?? h.descripcion ?? h.observaciones ?? '—') ||
                              '—'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {String(h.fecha_solicitud ?? '').slice(0, 10)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {String(h.fecha_requerida ?? '').slice(0, 10)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {String(h.fecha_inicio ?? '').slice(0, 10)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {String(h.fecha_final ?? '').slice(0, 10)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {String(h.NameAsignado ?? '')}
                          </td>
                        </tr>
                      ))}
                      {data.historial.correctivo.map((h, i) => (
                        <tr
                          key={`c-${i}`}
                          className="border-t border-emerald-100/80 bg-emerald-50/60 align-top"
                        >
                          <td className="px-3 py-2 font-medium whitespace-nowrap">
                            Correctivo
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {estadoLabel(h.estado as string, 'corr')}
                          </td>
                          <td className="max-w-[280px] px-3 py-2 text-[12px] leading-snug text-gray-800">
                            {String(h.solicitud ?? h.respuesta ?? '—') || '—'}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {String(h.fecha_solicitud ?? '').slice(0, 10)}
                          </td>
                          <td className="px-3 py-2">—</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {String(h.fecha_inicio ?? '').slice(0, 10)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {String(h.fecha_finalizacion ?? '').slice(0, 10)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {String(h.nombreE ?? '')}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
