'use client';

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { useToast } from '@/components/ui/use-toast';
import { AuditoriaPageFrame } from '@/modules/auditoria/components/AuditoriaPageFrame';
import { AUDITORIA_COPY } from '@/modules/auditoria/constants';
import { AuditoriaPager } from '@/modules/auditoria/shared/components/AuditoriaPager';
import { AuditoriaQueryError } from '@/modules/auditoria/shared/components/AuditoriaQueryError';
import { auditoriaKeys } from '@/modules/auditoria/shared/constants/query-keys';
import {
  btnToggleActiveClass,
  btnToggleClass,
  inputClass,
} from '@/modules/auditoria/shared/constants/ui';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { auditoriaService } from '@/modules/auditoria/shared/services/auditoria.service';
import { getErrorMessage } from '@/modules/auditoria/shared/utils/parse-api-error';
import { paginateRows } from '@/modules/auditoria/shared/utils/paginate';
import { ENTREGAS_AUDITORIA_SUBMENU_ID } from '@/utils/constants';

const MESES = [
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function colorPromedio(p: number): string {
  if (p > 100) return 'bg-[var(--color-success)]';
  if (p > 50) return 'bg-[var(--color-info)]';
  if (p > 20) return 'bg-[var(--color-warning)]';
  return 'bg-[var(--color-danger)]';
}

export function EntregasGestion() {
  const { user, blocked } = useAuditoriaPageGuard(ENTREGAS_AUDITORIA_SUBMENU_ID);
  const { showError } = useToast();
  const sesionLista = !!user && !blocked;
  const [ano, setAno] = useState(String(new Date().getFullYear()));
  const [applied, setApplied] = useState<{ ano: number; tipo: 1 | 2 } | null>(
    null,
  );
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: auditoriaKeys.entregas(applied?.ano ?? 0, applied?.tipo ?? 1),
    queryFn: () => auditoriaService.entregas(applied!.ano, applied!.tipo),
    enabled: sesionLista && !!applied,
    ...transactionalQueryOptions,
  });

  const rows = listQuery.data ?? [];
  const { pageRows, total, totalPages, safePage, inicio, fin } = paginateRows(
    rows,
    page,
  );
  const onPage = useCallback((p: number) => setPage(p), []);

  function cargar(tipo: 1 | 2) {
    const year = Number(ano);
    if (!year || year < 2022) {
      showError('Ingrese un año válido');
      return;
    }
    setApplied({ ano: year, tipo });
    setPage(1);
  }

  if (blocked) return null;

  const titulo =
    applied?.tipo === 1
      ? AUDITORIA_COPY.entregas.livianos
      : applied?.tipo === 2
        ? AUDITORIA_COPY.entregas.pesados
        : '';

  return (
    <AuditoriaPageFrame
      title={AUDITORIA_COPY.entregas.title}
      description={AUDITORIA_COPY.entregas.description}
      backLabel={AUDITORIA_COPY.backLabel}
    >
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label htmlFor="aud-ent-ano" className="sr-only">
          Año
        </label>
        <input
          id="aud-ent-ano"
          type="number"
          min={2022}
          max={2100}
          className={`w-28 ${inputClass}`}
          value={ano}
          onChange={(e) => setAno(e.target.value.slice(0, 4))}
        />
        <button
          type="button"
          onClick={() => cargar(1)}
          className={applied?.tipo === 1 ? btnToggleActiveClass : btnToggleClass}
        >
          {AUDITORIA_COPY.entregas.livianos}
        </button>
        <button
          type="button"
          onClick={() => cargar(2)}
          className={applied?.tipo === 2 ? btnToggleActiveClass : btnToggleClass}
        >
          {AUDITORIA_COPY.entregas.pesados}
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
        {[
          { cls: 'bg-[var(--color-success)]', label: 'Mayor a 100' },
          { cls: 'bg-[var(--color-info)]', label: 'Mayor a 50 y menor a 100' },
          { cls: 'bg-[var(--color-warning)]', label: 'Mayor a 20 y menor a 50' },
          { cls: 'bg-[var(--color-danger)]', label: 'Menor a 20' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <span className={`inline-block h-5 w-5 rounded-full ${l.cls}`} />
            {l.label}
          </div>
        ))}
      </div>

      {listQuery.isError ? (
        <AuditoriaQueryError
          message={getErrorMessage(
            listQuery.error,
            AUDITORIA_COPY.entregas.loadError,
          )}
        />
      ) : null}

      {titulo ? (
        <h2 className="text-center text-lg font-semibold text-gray-700">
          {titulo}
        </h2>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm">
        <table className="min-w-full text-center text-sm">
          <thead className="bg-(--color-primary) text-white">
            <tr>
              <th className="px-3 py-2.5">Mes</th>
              <th className="px-3 py-2.5">Entregas</th>
              <th className="px-3 py-2.5">Segunda entrega</th>
              <th className="px-3 py-2.5">Promedio</th>
            </tr>
          </thead>
          <tbody>
            {listQuery.isFetching && !listQuery.data ? (
              <tr>
                <td colSpan={4} className="py-8 text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-gray-500">
                  {AUDITORIA_COPY.entregas.empty}
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.mes} className="border-t">
                  <td className="px-3 py-2">{MESES[r.mes] ?? r.mes}</td>
                  <td className="px-3 py-2">{r.entregas}</td>
                  <td className="px-3 py-2">{r.segunda_entrega}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex min-w-[3rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold text-white ${colorPromedio(r.promedio)}`}
                    >
                      {r.promedio.toFixed(1)}%
                    </span>
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
