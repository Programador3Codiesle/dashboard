'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { ITicket, Prioridad } from '@/modules/tickets/types';
import { usePagination } from '@/components/shared/ui/hooks/usePagination';
import { Pagination } from '@/components/shared/ui/Pagination';

const HEADERS = [
  'Ticket',
  'Estado',
  'Prioridad',
  'Soporte',
  'Usuario',
  'Encargado',
  'Fecha',
] as const;

export function TicketsPrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shadow-sm ${
        prioridad === 'alta'
          ? 'bg-red-100 text-red-700 border border-red-200'
          : prioridad === 'media'
            ? 'brand-badge border border-[var(--color-primary)]'
            : 'bg-gray-100 text-gray-700 border border-gray-200'
      }`}
    >
      {prioridad}
    </span>
  );
}

export function TicketsTable({
  tickets,
  loading,
  loadingUi,
  emptyUi,
  minWidthClass,
  renderEstado,
  renderUsuario,
  renderEncargado,
  renderAcciones,
}: {
  tickets: ITicket[];
  loading: boolean;
  loadingUi: ReactNode;
  emptyUi: ReactNode;
  minWidthClass: string;
  renderEstado: (ticket: ITicket) => ReactNode;
  renderUsuario: (ticket: ITicket) => ReactNode;
  renderEncargado: (ticket: ITicket) => ReactNode;
  renderAcciones?: (ticket: ITicket) => ReactNode;
}) {
  const { currentPage, totalPages, startIndex, endIndex, changePage } =
    usePagination(tickets.length, 5);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      changePage(1);
    }
  }, [tickets.length, currentPage, totalPages, changePage]);

  const ticketsMostrados = useMemo(
    () => tickets.slice(startIndex, endIndex),
    [tickets, startIndex, endIndex],
  );

  if (loading) return <>{loadingUi}</>;
  if (!tickets.length) return <>{emptyUi}</>;

  const showActions = Boolean(renderAcciones);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="app-table-scroll border-0 rounded-none">
        <table data-testid="tickets-table" className={`${minWidthClass} w-full`}>
          <thead>
            <tr className="brand-bg-gradient border-b-2 border-[var(--color-primary-dark)] text-center">
              {HEADERS.map((header) => (
                <th
                  key={header}
                  className="py-3 px-3 sm:py-5 sm:px-6 text-xs sm:text-sm font-bold text-white uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
              {showActions ? (
                <th className="py-3 px-3 sm:py-5 sm:px-6 text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  Acciones
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {ticketsMostrados.map((ticket, index) => (
              <tr
                key={ticket.id}
                className={`transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } hover:brand-bg-light hover:shadow-sm text-center`}
              >
                <td className="py-3 px-3 sm:py-5 sm:px-6 whitespace-nowrap">
                  <span className="text-sm font-bold text-gray-900">
                    #{ticket.id}
                  </span>
                </td>
                <td className="py-3 px-3 sm:py-5 sm:px-6 whitespace-nowrap">
                  {renderEstado(ticket)}
                </td>
                <td className="py-3 px-3 sm:py-5 sm:px-6 whitespace-nowrap">
                  <TicketsPrioridadBadge prioridad={ticket.prioridad} />
                </td>
                <td className="py-3 px-3 sm:py-5 sm:px-6 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-700">
                    {ticket.tipoSoporte}
                  </span>
                </td>
                <td className="py-3 px-3 sm:py-5 sm:px-6 whitespace-nowrap">
                  {renderUsuario(ticket)}
                </td>
                <td className="py-3 px-3 sm:py-5 sm:px-6 whitespace-nowrap">
                  {renderEncargado(ticket)}
                </td>
                <td className="py-3 px-3 sm:py-5 sm:px-6 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {new Date(ticket.fechaCreacion).toLocaleDateString()}
                  </span>
                </td>
                {showActions ? (
                  <td className="py-3 px-3 sm:py-5 sm:px-6 whitespace-nowrap">
                    {renderAcciones?.(ticket)}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 sm:mt-6 px-3 sm:px-6 pb-3 sm:pb-6 bg-gray-50/50 border-t border-gray-200 pt-4 sm:pt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onChange={changePage}
          />
        </div>
      )}
    </div>
  );
}
