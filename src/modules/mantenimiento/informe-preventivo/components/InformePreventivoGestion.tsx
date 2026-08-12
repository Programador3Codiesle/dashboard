'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { mantenimientoService } from '@/modules/mantenimiento/shared/services/mantenimiento.service';
import {
  estadoLabel,
  SEDES_INFORME_PREVENTIVO,
} from '@/modules/mantenimiento/shared/constants/labels';
import { INFORME_PREVENTIVO_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 20;

export function InformePreventivoGestion() {
  const { blocked } = useMantenimientoPageGuard(INFORME_PREVENTIVO_SUBMENU_ID);
  const { showError } = useToast();
  const [bodega, setBodega] = useState('');
  const [estado, setEstado] = useState('');
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (blocked) return;
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  async function cargar(fEstado = estado, fBodega = bodega) {
    setLoading(true);
    try {
      const data = await mantenimientoService.informePreventivo(
        fEstado || undefined,
        fBodega || undefined,
      );
      setRows(data);
      setPage(1);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);
  const onPage = useCallback((p: number) => setPage(p), []);

  function exportExcel() {
    const data = rows.map((r) => ({
      CODIGO: r.codigo_equipo,
      EQUIPO: r.nombre_equipo,
      AREA: r.area,
      BODEGA: r.bodega,
      DESCRIPCION: r.descripcion,
      OBSERVACIONES: r.observaciones,
      PIEZAS: r.detalle_piezas,
      RESPONSABLE: r.NameResponsable,
      ENCARGADO: r.NameAsignado,
      ESTADO: estadoLabel(r.estado as string, 'prev'),
      TIEMPO: r.tiempo_estimado,
      F_SOLICITUD: r.fecha_solicitud,
      F_REQUERIDA: r.fecha_requerida,
      F_INICIO: r.fecha_inicio,
      F_FINAL: r.fecha_final,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Preventivo');
    XLSX.writeFile(wb, `Informe-Preventivo.xlsx`);
  }

  if (blocked) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="app-title-xl brand-text">
          Informe de mantenimiento preventivo
        </h1>
        <Link
          href="/dashboard/mantenimiento"
          className="text-sm text-amber-700 hover:underline"
        >
          ← Volver a Mantenimiento
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label className="text-sm min-w-[180px]">
          Sede
          <select
            className="mt-1 block w-full rounded border px-3 py-2"
            value={bodega}
            onChange={(e) => setBodega(e.target.value)}
          >
            <option value="">Todas</option>
            {SEDES_INFORME_PREVENTIVO.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm min-w-[160px]">
          Estado
          <select
            className="mt-1 block w-full rounded border px-3 py-2"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="1">Pendiente</option>
            <option value="2">En proceso</option>
            <option value="3">Realizados</option>
          </select>
        </label>
        <button
          type="button"
          className="rounded-md bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white"
          onClick={() => cargar()}
          disabled={loading}
        >
          Cargar
        </button>
        <button
          type="button"
          className="rounded-md border px-4 py-2 text-sm"
          onClick={() => {
            setBodega('');
            setEstado('');
            void cargar('', '');
          }}
        >
          Refrescar
        </button>
        <button
          type="button"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          onClick={exportExcel}
        >
          Descargar
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm max-h-[75vh]">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="sticky top-0 bg-(--color-primary) text-white">
            <tr>
              {[
                'CODIGO',
                'EQUIPO',
                'ÁREA',
                'BODEGA',
                'DESCRIPCIÓN',
                'OBS.',
                'PIEZAS',
                'RESPONSABLE',
                'ENCARGADO',
                'ESTADO',
                'TIEMPO',
                'F.SOL',
                'F.REQ',
                'F.INI',
                'F.FIN',
              ].map((h) => (
                <th key={h} className="px-2 py-2 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={15} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-8 text-center text-gray-500">
                  Sin información
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr key={i} className="border-t text-center">
                  <td className="px-2 py-1.5">{String(r.codigo_equipo ?? '')}</td>
                  <td className="px-2 py-1.5 text-left">
                    {String(r.nombre_equipo ?? '')}
                  </td>
                  <td className="px-2 py-1.5">{String(r.area ?? '')}</td>
                  <td className="px-2 py-1.5">{String(r.bodega ?? '')}</td>
                  <td className="px-2 py-1.5 text-left max-w-[180px] truncate">
                    {String(r.descripcion ?? '')}
                  </td>
                  <td className="px-2 py-1.5 max-w-[120px] truncate">
                    {String(r.observaciones ?? '')}
                  </td>
                  <td className="px-2 py-1.5 max-w-[120px] truncate">
                    {String(r.detalle_piezas ?? '')}
                  </td>
                  <td className="px-2 py-1.5">{String(r.NameResponsable ?? '')}</td>
                  <td className="px-2 py-1.5">{String(r.NameAsignado ?? '')}</td>
                  <td className="px-2 py-1.5">
                    {estadoLabel(r.estado as string, 'prev')}
                  </td>
                  <td className="px-2 py-1.5">{String(r.tiempo_estimado ?? '')}</td>
                  <td className="px-2 py-1.5">
                    {String(r.fecha_solicitud ?? '').slice(0, 10)}
                  </td>
                  <td className="px-2 py-1.5">
                    {String(r.fecha_requerida ?? '').slice(0, 10)}
                  </td>
                  <td className="px-2 py-1.5">
                    {String(r.fecha_inicio ?? '').slice(0, 10)}
                  </td>
                  <td className="px-2 py-1.5">
                    {String(r.fecha_final ?? '').slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {rows.length > PAGE_SIZE && (
          <div className="mt-4">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onChange={onPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
