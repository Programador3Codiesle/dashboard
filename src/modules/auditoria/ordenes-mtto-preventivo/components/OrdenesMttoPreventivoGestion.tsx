'use client';

import { useCallback, useState } from 'react';
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
import { ORDENES_MTTO_PREVENTIVO_SUBMENU_ID } from '@/utils/constants';

type Row = {
  ano: number;
  mes: number;
  sede: string;
  cantidad_ot: number;
  presupuesto_ordenes: number;
  cumplimiento: number;
};

export function OrdenesMttoPreventivoGestion() {
  const { user, blocked } = useAuditoriaPageGuard(
    ORDENES_MTTO_PREVENTIVO_SUBMENU_ID,
  );
  const { showError } = useToast();
  const sesionLista = !!user && !blocked;
  const [bodega, setBodega] = useState('');
  const [applied, setApplied] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: auditoriaKeys.ordenesMtto(applied ?? ''),
    queryFn: () =>
      auditoriaService.ordenesMttoPreventivo(applied!) as Promise<Row[]>,
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
      title={AUDITORIA_COPY.ordenesMtto.title}
      description={AUDITORIA_COPY.ordenesMtto.description}
      backLabel={AUDITORIA_COPY.backLabel}
    >
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label htmlFor="aud-mtto-bodega" className="min-w-[240px] text-sm">
          Bodega
          <select
            id="aud-mtto-bodega"
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
            if (!bodega) {
              showError('Seleccione una bodega');
              return;
            }
            setApplied(bodega);
            setPage(1);
          }}
        >
          <Search className="h-4 w-4" /> Buscar
        </button>
      </div>

      {listQuery.isError ? (
        <AuditoriaQueryError
          message={getErrorMessage(
            listQuery.error,
            AUDITORIA_COPY.ordenesMtto.loadError,
          )}
        />
      ) : null}

      <div className="overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-(--color-primary) text-white">
            <tr>
              {[
                'FECHA',
                'SEDE',
                'N° ORDEN DE TRABAJO',
                'PRESUPUESTO ORDENES',
                'CUMPLIMIENTO',
              ].map((h) => (
                <th key={h} className="px-3 py-2.5 text-center font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listQuery.isFetching && !listQuery.data ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  {AUDITORIA_COPY.ordenesMtto.empty}
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr
                  key={`${r.ano}-${r.mes}-${r.sede}`}
                  className="border-t text-center"
                >
                  <td className="px-3 py-2">
                    {r.ano}-{String(r.mes).padStart(2, '0')}
                  </td>
                  <td className="px-3 py-2 text-left">{r.sede}</td>
                  <td className="px-3 py-2">{r.cantidad_ot}</td>
                  <td className="px-3 py-2">{r.presupuesto_ordenes}</td>
                  <td className="px-3 py-2 font-semibold">
                    {r.cumplimiento.toFixed(1)}%
                  </td>
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
      </div>
    </AuditoriaPageFrame>
  );
}
