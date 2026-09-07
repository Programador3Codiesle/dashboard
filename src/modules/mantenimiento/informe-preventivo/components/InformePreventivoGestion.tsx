'use client';

import { useCallback, useState } from 'react';
import { getXlsx } from '@/utils/export-xlsx';
import { useQuery } from '@tanstack/react-query';
import { Pagination } from '@/components/shared/ui/Pagination';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { MantenimientoPageFrame } from '@/modules/mantenimiento/components/MantenimientoPageFrame';
import { MANTENIMIENTO_COPY } from '@/modules/mantenimiento/constants';
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
import {
  estadoLabel,
  SEDES_INFORME_PREVENTIVO,
} from '@/modules/mantenimiento/shared/constants/labels';
import { getErrorMessage } from '@/modules/mantenimiento/shared/utils/parse-api-error';
import { paginateRows } from '@/modules/mantenimiento/shared/utils/paginate';
import { INFORME_PREVENTIVO_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 20;

export function InformePreventivoGestion() {
  const { blocked, user } = useMantenimientoPageGuard(
    INFORME_PREVENTIVO_SUBMENU_ID,
  );
  const sesionLista = !!user && !blocked;
  const [bodega, setBodega] = useState('');
  const [estado, setEstado] = useState('');
  const [applied, setApplied] = useState({ estado: '', bodega: '' });
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: mantenimientoKeys.informePreventivo(
      applied.estado,
      applied.bodega,
    ),
    queryFn: () =>
      mantenimientoService.informePreventivo(
        applied.estado || undefined,
        applied.bodega || undefined,
      ),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const rows = listQuery.data ?? [];
  const { pageRows, totalPages, safePage } = paginateRows(
    rows,
    page,
    PAGE_SIZE,
  );
  const onPage = useCallback((p: number) => setPage(p), []);

  async function exportExcel() {
    const XLSX = await getXlsx();
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
    <MantenimientoPageFrame title={MANTENIMIENTO_COPY.informePreventivo.title}>
      <div className="app-section-card w-full min-w-0">
        <div className="app-form-grid-2">
          <label className="w-full min-w-0 text-sm">
            Sede
            <select
              className={inputClass}
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
          <label className="w-full min-w-0 text-sm">
            Estado
            <select
              className={inputClass}
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="1">Pendiente</option>
              <option value="2">En proceso</option>
              <option value="3">Realizados</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={btnPrimaryClass}
            onClick={() => {
              setApplied({ estado, bodega });
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
              setBodega('');
              setEstado('');
              setApplied({ estado: '', bodega: '' });
              setPage(1);
            }}
          >
            Refrescar
          </button>
          <button
            type="button"
            className={btnSuccessClass}
            onClick={exportExcel}
          >
            Descargar
          </button>
        </div>
      </div>

      {listQuery.isError ? (
        <MantenimientoQueryError
          message={getErrorMessage(
            listQuery.error,
            MANTENIMIENTO_COPY.informePreventivo.loadError,
          )}
        />
      ) : null}

      <div className="app-section-card w-full min-w-0">
        <div className="app-table-scroll">
        <table className="w-full min-w-[1200px] text-xs md:text-sm">
          <thead className="sticky top-0 brand-bg text-white">
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
            {listQuery.isFetching && rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-8 text-center text-gray-500">
                  {MANTENIMIENTO_COPY.informePreventivo.empty}
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
        </div>
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
    </MantenimientoPageFrame>
  );
}
