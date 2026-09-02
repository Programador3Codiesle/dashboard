'use client';

import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  catalogQueryOptions,
  transactionalQueryOptions,
} from '@/core/query/catalog-query-options';
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
import { ORDENES_TECNICOS_SUBMENU_ID } from '@/utils/constants';

type Row = {
  ano: number;
  mes: number;
  descripcion: string;
  nombres: string;
  ordenes: number;
  presupuesto_ordenes: number;
  cumplimiento: number;
};

export function OrdenesTecnicosGestion() {
  const { user, blocked } = useAuditoriaPageGuard(ORDENES_TECNICOS_SUBMENU_ID);
  const { showError } = useToast();
  const sesionLista = !!user && !blocked;
  const [bodega, setBodega] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [applied, setApplied] = useState<{
    bodega?: string;
    tecnico?: string;
  } | null>(null);
  const [page, setPage] = useState(1);

  const tecnicosQuery = useQuery({
    queryKey: auditoriaKeys.tecnicos,
    queryFn: () => auditoriaService.tecnicos(),
    enabled: sesionLista,
    ...catalogQueryOptions,
  });

  const listQuery = useQuery({
    queryKey: auditoriaKeys.ordenesTecnicos(
      applied?.bodega ?? '',
      applied?.tecnico ?? '',
    ),
    queryFn: () => auditoriaService.ordenesTecnicos(applied!) as Promise<Row[]>,
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
      title={AUDITORIA_COPY.ordenesTecnicos.title}
      description={AUDITORIA_COPY.ordenesTecnicos.description}
      backLabel={AUDITORIA_COPY.backLabel}
    >
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label htmlFor="aud-ot-bodega" className="min-w-[200px] text-sm">
          Bodega
          <select
            id="aud-ot-bodega"
            className={inputClass}
            value={bodega}
            onChange={(e) => {
              setBodega(e.target.value);
              if (e.target.value) setTecnico('');
            }}
          >
            <option value="">Seleccione...</option>
            {BODEGAS_AUDITORIA_BASE.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="aud-ot-tecnico" className="min-w-[220px] text-sm">
          Técnico
          <select
            id="aud-ot-tecnico"
            className={inputClass}
            value={tecnico}
            onChange={(e) => {
              setTecnico(e.target.value);
              if (e.target.value) setBodega('');
            }}
          >
            <option value="">Seleccione...</option>
            {(tecnicosQuery.data ?? []).map((t) => (
              <option key={t.nit} value={t.nit}>
                {t.nombre}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className={btnPrimaryClass}
          disabled={listQuery.isFetching}
          onClick={() => {
            if (!bodega && !tecnico) {
              showError('Seleccione bodega o técnico');
              return;
            }
            setApplied({
              bodega: bodega || undefined,
              tecnico: tecnico || undefined,
            });
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
            AUDITORIA_COPY.ordenesTecnicos.loadError,
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
                'TÉCNICO',
                'CANTIDAD ORDENES',
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
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  {AUDITORIA_COPY.ordenesTecnicos.empty}
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr
                  key={`${r.ano}-${r.mes}-${r.nombres}-${i}`}
                  className="border-t text-center"
                >
                  <td className="px-3 py-2">
                    {r.ano}-{String(r.mes).padStart(2, '0')}
                  </td>
                  <td className="px-3 py-2 text-left">{r.descripcion}</td>
                  <td className="px-3 py-2 text-left">{r.nombres}</td>
                  <td className="px-3 py-2">{r.ordenes}</td>
                  <td className="px-3 py-2">{r.presupuesto_ordenes.toFixed(1)}</td>
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
