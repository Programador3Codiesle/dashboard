'use client';

import TicketsTableFinalizados from './TicketsTableFinalizados';
import { useTickets } from '../hooks/useTickets';

export function TicketsFinalizadosGestion() {
  const { tickets, loading } = useTickets('finalizados');

  return (
    <div>
      <TicketsTableFinalizados tickets={tickets} loading={loading} />
    </div>
  );
}
