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
  urgenciaLabel,
} from '@/modules/mantenimiento/shared/constants/labels';
import { INFORME_CORRECTIVO_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 20;

export function InformeCorrectivoGestion() {
  const { blocked } = useMantenimientoPageGuard(INFORME_CORRECTIVO_SUBMENU_ID);
  const { showError } = useToast();
  const [bodegas, setBodegas] = useState<
    Array<{ bodega: number; descripcion: string }>
  >([]);
  const [bodega, setBodega] = useState('');
  const [estado, setEstado] = useState('');
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (blocked) return;
    mantenimientoService
      .catalogos()
      .then((c) => setBodegas(c.bodegas))
      .catch(() => undefined);
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocked]);

  async function cargar(fEstado = estado, fBodega = bodega) {
    setLoading(true);
    try {
      const data = await mantenimientoService.informeCorrectivo(
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
      CODIGO: r.codigo,
      EQUIPO: r.nombre_equipo,
      SEDE: r.descripcion,
      JEFE: r.Njefe,
      SOLICITUD: r.solicitud,
      URGENCIA: urgenciaLabel(r.urgencia as string),
      ENCARGADO: r.Nencargado,
      RESPUESTA: r.respuesta,
      ESTADO: estadoLabel(r.estado as string, 'corr'),
      FECHA_SOLICITUD: r.fecha_solicitud,
      FECHA_INICIO: r.fecha_inicio,
      FECHA_FINAL: r.fecha_finalizacion,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Correctivo');
    XLSX.writeFile(wb, `Informe-Correctivo.xlsx`);
  }

  if (blocked) return null;

  return (
    <div className="space-y-4">
      <Header title="Informe de mantenimiento correctivo" />
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label className="text-sm min-w-[200px]">
          Sede / Bodega
          <select
            className="mt-1 block w-full rounded border px-3 py-2"
            value={bodega}
            onChange={(e) => setBodega(e.target.value)}
          >
            <option value="">Todos</option>
            {bodegas.map((b) => (
              <option key={b.bodega} value={String(b.bodega)}>
                {b.descripcion}
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
            <option value="3">Finalizada</option>
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
                'SEDE',
                'JEFE',
                'SOLICITUD',
                'URGENCIA',
                'ENCARGADO',
                'RESPUESTAS',
                'ESTADO',
                'F. SOLICITUD',
                'F. INICIO',
                'F. FINAL',
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
                <td colSpan={12} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-gray-500">
                  Sin información
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr key={i} className="border-t text-center">
                  <td className="px-2 py-1.5">{String(r.codigo ?? '')}</td>
                  <td className="px-2 py-1.5 text-left">
                    {String(r.nombre_equipo ?? '')}
                  </td>
                  <td className="px-2 py-1.5">{String(r.descripcion ?? '')}</td>
                  <td className="px-2 py-1.5">{String(r.Njefe ?? '')}</td>
                  <td className="px-2 py-1.5 text-left max-w-[200px] truncate">
                    {String(r.solicitud ?? '')}
                  </td>
                  <td className="px-2 py-1.5">
                    {urgenciaLabel(r.urgencia as string)}
                  </td>
                  <td className="px-2 py-1.5">{String(r.Nencargado ?? '')}</td>
                  <td className="px-2 py-1.5 text-left max-w-[160px] truncate">
                    {String(r.respuesta ?? '')}
                  </td>
                  <td className="px-2 py-1.5">
                    {estadoLabel(r.estado as string, 'corr')}
                  </td>
                  <td className="px-2 py-1.5">
                    {String(r.fecha_solicitud ?? '').slice(0, 10)}
                  </td>
                  <td className="px-2 py-1.5">
                    {String(r.fecha_inicio ?? '').slice(0, 10)}
                  </td>
                  <td className="px-2 py-1.5">
                    {String(r.fecha_finalizacion ?? '').slice(0, 10)}
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

function Header({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="app-title-xl brand-text">{title}</h1>
      <Link
        href="/dashboard/mantenimiento"
        className="text-sm text-amber-700 hover:underline"
      >
        ← Volver a Mantenimiento
      </Link>
    </div>
  );
}
