'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Eye, Search } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { EncuestasPageFrame } from '@/modules/encuestas/components/EncuestasPageFrame';
import { ENCUESTAS_COPY } from '@/modules/encuestas/constants';
import { EncuestasQueryError } from '@/modules/encuestas/shared/components/EncuestasQueryError';
import { encuestasKeys } from '@/modules/encuestas/shared/constants/query-keys';
import { inputClass } from '@/modules/encuestas/shared/constants/ui';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import { encuestasService } from '@/modules/encuestas/shared/services/encuestas.service';
import { getErrorMessage } from '@/modules/encuestas/shared/utils/parse-api-error';
import { SATISFACCION_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 15;

export function SatisfaccionListadoGestion() {
  const { user, blocked } = useEncuestasPageGuard(SATISFACCION_SUBMENU_ID);
  const sesionLista = !!user && !blocked;
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: encuestasKeys.satisfaccion(q.trim(), page),
    queryFn: () =>
      encuestasService.listarSatisfaccion({
        q,
        page,
        pageSize: PAGE_SIZE,
      }),
    enabled: sesionLista,
    placeholderData: keepPreviousData,
    ...transactionalQueryOptions,
  });

  const items = listQuery.data?.items ?? [];
  const totalItems = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const handlePageChange = useCallback((next: number) => {
    setPage(next);
  }, []);

  const inicioRango = totalItems === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const finRango = Math.min(safePage * PAGE_SIZE, totalItems);

  if (blocked) return null;

  return (
    <EncuestasPageFrame
      title={ENCUESTAS_COPY.satisfaccion.title}
      description={ENCUESTAS_COPY.satisfaccion.description}
      backHref="/dashboard/encuestas"
      backLabel={ENCUESTAS_COPY.satisfaccion.backLabel}
    >
      <div className="app-section-card w-full min-w-0">
        <div className="relative w-full min-w-0 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <label htmlFor="encuestas-satisfaccion-q" className="sr-only">
            Buscar
          </label>
          <input
            id="encuestas-satisfaccion-q"
            data-testid="encuestas-satisfaccion-search"
            className={`${inputClass} pl-9`}
            placeholder={ENCUESTAS_COPY.satisfaccion.searchPlaceholder}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {listQuery.isError ? (
        <EncuestasQueryError
          message={getErrorMessage(
            listQuery.error,
            ENCUESTAS_COPY.satisfaccion.loadError,
          )}
        />
      ) : null}

      <div
        data-testid="encuestas-satisfaccion-table"
        className="app-section-card w-full min-w-0"
      >
        <div className="app-table-scroll">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="brand-bg text-white">
            <tr>
              <th className="px-3 py-2.5 text-left font-semibold">NIT</th>
              <th className="px-3 py-2.5 text-left font-semibold">Cliente</th>
              <th className="px-3 py-2.5 text-left font-semibold">N° Orden</th>
              <th className="px-3 py-2.5 text-left font-semibold">Placa</th>
              <th className="px-3 py-2.5 text-left font-semibold">Fecha</th>
              <th className="px-3 py-2.5 text-center font-semibold">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {listQuery.isPending && !listQuery.data ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                  {ENCUESTAS_COPY.satisfaccion.empty}
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr
                  key={`${row.numero}-${row.placa}-${row.fecha}`}
                  className="border-t border-gray-100"
                >
                  <td className="px-3 py-2">{row.nit_real}</td>
                  <td className="px-3 py-2">{row.nombres}</td>
                  <td className="px-3 py-2">{row.numero}</td>
                  <td className="px-3 py-2">{row.placa}</td>
                  <td className="px-3 py-2">{row.fecha || '—'}</td>
                  <td className="px-3 py-2 text-center">
                    <Link
                      href={`/dashboard/encuestas/satisfaccion/detalle?ot=${encodeURIComponent(row.numero)}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md brand-bg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Ver
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {totalItems > 0 && !(listQuery.isPending && !listQuery.data) && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Mostrando {inicioRango}–{finRango} de {totalItems} ({PAGE_SIZE} por
              página)
            </p>
            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            )}
          </div>
        )}
      </div>
    </EncuestasPageFrame>
  );
}
