'use client';

import { useState } from 'react';
import { getXlsx } from '@/utils/export-xlsx';
import { useQuery } from '@tanstack/react-query';
import { Pagination } from '@/components/shared/ui/Pagination';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { MantenimientoPageFrame } from '@/modules/mantenimiento/components/MantenimientoPageFrame';
import { MANTENIMIENTO_COPY } from '@/modules/mantenimiento/constants';
import { periodoMttoLabel } from '@/modules/mantenimiento/equipos/utils/hoja-vida';
import { MantenimientoQueryError } from '@/modules/mantenimiento/shared/components/MantenimientoQueryError';
import { mantenimientoKeys } from '@/modules/mantenimiento/shared/constants/query-keys';
import {
  btnPrimaryClass,
  btnSecondaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/mantenimiento/shared/constants/ui';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { mantenimientoService } from '@/modules/mantenimiento/shared/services/mantenimiento.service';
import { getErrorMessage } from '@/modules/mantenimiento/shared/utils/parse-api-error';
import { paginateRows } from '@/modules/mantenimiento/shared/utils/paginate';
import { EQUIPOS_MANTENIMIENTO_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 20;

function monthRange(d = new Date()) {
  const y = d.getFullYear();
  const m = d.getMonth();
  const desde = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const last = new Date(y, m + 1, 0).getDate();
  const hasta = `${y}-${String(m + 1).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
  return { desde, hasta };
}

export function InformeEquiposGestion() {
  const { blocked, user } = useMantenimientoPageGuard(
    EQUIPOS_MANTENIMIENTO_SUBMENU_ID,
  );
  const sesionLista = !!user && !blocked;
  const initial = monthRange();
  const [desde, setDesde] = useState(initial.desde);
  const [hasta, setHasta] = useState(initial.hasta);
  const [applied, setApplied] = useState(initial);
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: mantenimientoKeys.informeEquipos(applied.desde, applied.hasta),
    queryFn: () =>
      mantenimientoService.informeEquiposPreventivo(
        applied.desde,
        applied.hasta,
      ),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const resumen = listQuery.data?.resumen ?? [];
  const rows = listQuery.data?.listado ?? [];
  const total = listQuery.data?.total ?? 0;
  const { pageRows, totalPages, safePage } = paginateRows(
    rows,
    page,
    PAGE_SIZE,
  );

  async function exportExcel() {
    const XLSX = await getXlsx();
    const data = rows.map((r) => ({
      CODIGO: r.codigo,
      EQUIPO: r.nombre_equipo,
      AREA: r.area,
      BODEGA: r.bodega,
      PERIODO: r.periodo ? periodoMttoLabel(r.periodo) : '',
      DESCRIPCION: r.descripcion,
      ASIGNADO: r.asignado,
      F_REQUERIDA: r.fecha_requerida,
      F_FINAL: r.fecha_final,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Preventivos');
    XLSX.writeFile(
      wb,
      `Informe-Equipos-Preventivo-${applied.desde}_${applied.hasta}.xlsx`,
    );
  }

  if (blocked) return null;

  return (
    <MantenimientoPageFrame
      title={MANTENIMIENTO_COPY.informeEquipos.title}
      backHref="/dashboard/mantenimiento/equipos"
      backLabel={MANTENIMIENTO_COPY.backEquipos}
    >
      <div className="app-section-card w-full min-w-0">
        <div className="app-form-grid-2">
          <label className="w-full min-w-0 text-sm">
            Fecha final desde
            <input
              type="date"
              className={inputClass}
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </label>
          <label className="w-full min-w-0 text-sm">
            Fecha final hasta
            <input
              type="date"
              className={inputClass}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={btnPrimaryClass}
            onClick={() => {
              setApplied({ desde, hasta });
              setPage(1);
            }}
            disabled={listQuery.isFetching}
          >
            {listQuery.isFetching ? 'Cargando...' : 'Cargar'}
          </button>
          <button
            type="button"
            className={btnSecondaryClass}
            onClick={() => {
              const next = monthRange();
              setDesde(next.desde);
              setHasta(next.hasta);
              setApplied(next);
              setPage(1);
            }}
          >
            Mes actual
          </button>
          <button
            type="button"
            className={btnSuccessClass}
            onClick={() => void exportExcel()}
          >
            Descargar
          </button>
        </div>
      </div>

      {listQuery.isError ? (
        <MantenimientoQueryError
          message={getErrorMessage(
            listQuery.error,
            MANTENIMIENTO_COPY.informeEquipos.loadError,
          )}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200/80 bg-white p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            Total realizados
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{total}</p>
        </div>
        {resumen.map((r) => (
          <div
            key={r.mes}
            className="rounded-xl border border-gray-200/80 bg-white p-3.5"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {r.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {r.total}
            </p>
          </div>
        ))}
      </div>

      <div className="app-section-card w-full min-w-0">
        <div
          data-testid="mtto-informe-equipos-table"
          className="app-table-scroll"
        >
          <table className="w-full min-w-[960px] text-xs md:text-sm">
            <thead className="sticky top-0 brand-bg text-white">
              <tr>
                {[
                  'CODIGO',
                  'EQUIPO',
                  'ÁREA',
                  'BODEGA',
                  'PERIODO',
                  'DESCRIPCIÓN',
                  'ASIGNADO',
                  'F.REQ',
                  'F.FIN',
                ].map((h) => (
                  <th key={h} className="px-2 py-2 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listQuery.isFetching && rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    {MANTENIMIENTO_COPY.informeEquipos.empty}
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={r.id_mantenimientos} className="border-t text-center">
                    <td className="px-2 py-1.5">{r.codigo}</td>
                    <td className="px-2 py-1.5 text-left">{r.nombre_equipo}</td>
                    <td className="px-2 py-1.5">{r.area}</td>
                    <td className="px-2 py-1.5">{r.bodega}</td>
                    <td className="px-2 py-1.5">
                      {r.periodo ? periodoMttoLabel(r.periodo) : '—'}
                    </td>
                    <td className="px-2 py-1.5 text-left max-w-[220px] truncate">
                      {r.descripcion}
                    </td>
                    <td className="px-2 py-1.5">{r.asignado ?? '—'}</td>
                    <td className="px-2 py-1.5">{r.fecha_requerida}</td>
                    <td className="px-2 py-1.5">{r.fecha_final}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {rows.length > PAGE_SIZE ? (
          <div className="mt-4">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </MantenimientoPageFrame>
  );
}
