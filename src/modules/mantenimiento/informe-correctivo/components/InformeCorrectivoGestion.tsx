'use client';

import { useCallback, useState } from 'react';
import { getXlsx } from '@/utils/export-xlsx';
import { useQuery } from '@tanstack/react-query';
import { Pagination } from '@/components/shared/ui/Pagination';
import {
  catalogQueryOptions,
  transactionalQueryOptions,
} from '@/core/query/catalog-query-options';
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
  urgenciaLabel,
} from '@/modules/mantenimiento/shared/constants/labels';
import { getErrorMessage } from '@/modules/mantenimiento/shared/utils/parse-api-error';
import { paginateRows } from '@/modules/mantenimiento/shared/utils/paginate';
import { INFORME_CORRECTIVO_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 20;

export function InformeCorrectivoGestion() {
  const { blocked, user } = useMantenimientoPageGuard(
    INFORME_CORRECTIVO_SUBMENU_ID,
  );
  const sesionLista = !!user && !blocked;
  const [bodega, setBodega] = useState('');
  const [estado, setEstado] = useState('');
  const [applied, setApplied] = useState({ estado: '', bodega: '' });
  const [page, setPage] = useState(1);

  const catalogQuery = useQuery({
    queryKey: mantenimientoKeys.catalogos,
    queryFn: () => mantenimientoService.catalogos(),
    enabled: sesionLista,
    ...catalogQueryOptions,
  });

  const listQuery = useQuery({
    queryKey: mantenimientoKeys.informeCorrectivo(
      applied.estado,
      applied.bodega,
    ),
    queryFn: () =>
      mantenimientoService.informeCorrectivo(
        applied.estado || undefined,
        applied.bodega || undefined,
      ),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const bodegas = catalogQuery.data?.bodegas ?? [];
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
    <MantenimientoPageFrame title={MANTENIMIENTO_COPY.informeCorrectivo.title}>
      <div className="app-section-card w-full min-w-0">
        <div className="app-form-grid-2">
          <label className="w-full min-w-0 text-sm">
            Sede / Bodega
            <select
              className={inputClass}
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
              <option value="3">Finalizada</option>
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
            MANTENIMIENTO_COPY.informeCorrectivo.loadError,
          )}
        />
      ) : null}

      <div className="app-section-card w-full min-w-0">
        <div data-testid="mtto-informe-correctivo-table" className="app-table-scroll">
        <table className="w-full min-w-[1080px] text-xs md:text-sm">
          <thead className="sticky top-0 brand-bg text-white">
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
            {listQuery.isFetching && rows.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-gray-500">
                  {MANTENIMIENTO_COPY.informeCorrectivo.empty}
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
