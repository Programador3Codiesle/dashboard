'use client';

import TicketsTableMisTickets from './TicketsTableMisTickets';
import { useTickets } from '../hooks/useTickets';

export function TicketsMisGestion() {
  const { tickets, loading } = useTickets('mis');

  return (
    <div>
      <TicketsTableMisTickets tickets={tickets} loading={loading} />
    </div>
  );
}
