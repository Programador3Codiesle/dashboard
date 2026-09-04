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
import { AuditoriaTableCard } from '@/modules/auditoria/shared/components/AuditoriaTableCard';
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
      <div className="app-section-card w-full min-w-0">
        <div className="app-form-grid-3 items-end">
          <label htmlFor="aud-od-fecha" className="w-full min-w-0 text-sm">
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
          <label htmlFor="aud-od-bodega" className="w-full min-w-0 text-sm">
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
      </div>

      {listQuery.isError ? (
        <AuditoriaQueryError
          message={getErrorMessage(
            listQuery.error,
            AUDITORIA_COPY.ordenesDiarias.loadError,
          )}
        />
      ) : null}

      <AuditoriaTableCard
        footer={
          <AuditoriaPager
            total={total}
            page={safePage}
            totalPages={totalPages}
            onChange={onPage}
            inicio={inicio}
            fin={fin}
          />
        }
      >
        <table className="w-full min-w-[840px] text-sm">
          <thead className="brand-bg text-white">
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
      </AuditoriaTableCard>
    </AuditoriaPageFrame>
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
