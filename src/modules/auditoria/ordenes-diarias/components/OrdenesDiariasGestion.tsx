'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { useToast } from '@/components/ui/use-toast';
import { AuditoriaPageFrame } from '@/modules/auditoria/components/AuditoriaPageFrame';
import { AUDITORIA_COPY } from '@/modules/auditoria/constants';
import { AuditoriaPager } from '@/modules/auditoria/shared/components/AuditoriaPager';
import { AuditoriaQueryError } from '@/modules/auditoria/shared/components/AuditoriaQueryError';
import { BODEGAS_AUDITORIA_BASE } from '@/modules/auditoria/shared/constants/bodegas';
import { auditoriaKeys } from '@/modules/auditoria/shared/constants/query-keys';
import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/auditoria/shared/constants/ui';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { auditoriaService } from '@/modules/auditoria/shared/services/auditoria.service';
import { getErrorMessage } from '@/modules/auditoria/shared/utils/parse-api-error';
import { paginateRows } from '@/modules/auditoria/shared/utils/paginate';
import { CONTROL_ORDENES_DIARIAS_SUBMENU_ID } from '@/utils/constants';

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function OrdenesDiariasGestion() {
  const { user, blocked } = useAuditoriaPageGuard(
    CONTROL_ORDENES_DIARIAS_SUBMENU_ID,
  );
  const { showError } = useToast();
  const sesionLista = !!user && !blocked;
  const [fecha, setFecha] = useState(todayYmd);
  const [bodega, setBodega] = useState('');
  const [applied, setApplied] = useState<{ fecha: string; bodega: string } | null>(
    null,
  );
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: auditoriaKeys.ordenesDiarias(
      applied?.fecha ?? '',
      applied?.bodega ?? '',
    ),
    queryFn: () =>
      auditoriaService.ordenesDiarias(applied!.fecha, applied!.bodega),
    enabled: sesionLista && !!applied,
    ...transactionalQueryOptions,
  });

  const rows = listQuery.data ?? [];
  const { pageRows, total, totalPages, safePage, inicio, fin } = paginateRows(
    rows,
    page,
  );
  const onPage = useCallback((p: number) => setPage(p), []);

  if (blocked) return null;

  return (
    <AuditoriaPageFrame
      title={AUDITORIA_COPY.ordenesDiarias.title}
      description={AUDITORIA_COPY.ordenesDiarias.description}
      backLabel={AUDITORIA_COPY.backLabel}
    >
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label htmlFor="aud-od-fecha" className="text-sm">
          Fecha
          <input
            id="aud-od-fecha"
            type="date"
            max={todayYmd()}
            className={inputClass}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>
        <label htmlFor="aud-od-bodega" className="min-w-[220px] text-sm">
          Bodega
          <select
            id="aud-od-bodega"
            className={inputClass}
            value={bodega}
            onChange={(e) => setBodega(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {BODEGAS_AUDITORIA_BASE.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={btnPrimaryClass}
          disabled={listQuery.isFetching}
          onClick={() => {
            if (!fecha || !bodega) {
              showError('Seleccione fecha y bodega');
              return;
            }
            setApplied({ fecha, bodega });
            setPage(1);
          }}
        >
          <Search className="h-4 w-4" />
          {listQuery.isFetching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {listQuery.isError ? (
        <AuditoriaQueryError
          message={getErrorMessage(
            listQuery.error,
            AUDITORIA_COPY.ordenesDiarias.loadError,
          )}
        />
      ) : null}

      <TableCard>
        <table className="min-w-full text-sm">
          <thead className="bg-(--color-primary) text-white">
            <tr>
              {[
                'NOMBRES',
                'MANT. PREVENTIVO',
                'MANT. CORRECTIVO',
                'GARANTÍA',
                'RETORNO',
                'COLISIÓN',
                'INTERNO',
              ].map((h) => (
                <th key={h} className="px-3 py-2.5 text-center font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listQuery.isFetching && !listQuery.data ? (
              <Empty colSpan={7} text="Cargando..." />
            ) : pageRows.length === 0 ? (
              <Empty colSpan={7} text={AUDITORIA_COPY.ordenesDiarias.empty} />
            ) : (
              pageRows.map((r, i) => (
                <tr
                  key={`${r.nombres}-${i}`}
                  className="border-t border-gray-100"
                >
                  <td className="px-3 py-2">{r.nombres}</td>
                  <td className="px-3 py-2 text-center">
                    {r.mantenimiento_preventivo}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {r.mantenimiento_correctivo}
                  </td>
                  <td className="px-3 py-2 text-center">{r.garantia}</td>
                  <td className="px-3 py-2 text-center">{r.retorno}</td>
                  <td className="px-3 py-2 text-center">{r.colision}</td>
                  <td className="px-3 py-2 text-center">{r.interno}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <AuditoriaPager
          total={total}
          page={safePage}
          totalPages={totalPages}
          onChange={onPage}
          inicio={inicio}
          fin={fin}
        />
      </TableCard>
    </AuditoriaPageFrame>
  );
}

function TableCard({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      {children}
    </div>
  );
}

function Empty({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-3 py-8 text-center text-gray-500">
        {text}
      </td>
    </tr>
  );
}
