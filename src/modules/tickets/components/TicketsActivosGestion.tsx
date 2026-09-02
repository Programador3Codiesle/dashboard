'use client';

import { useTickets } from '../hooks/useTickets';
import TicketsCardsActivos from './TicketsCardsActivos';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { puedeVerTodosLosTickets } from '../constants';

export function TicketsActivosGestion() {
  const { user } = useAuth();
  const { tickets, loading } = useTickets('activos');

  if (!puedeVerTodosLosTickets(user?.perfil_postventa)) {
    return <div className="p-3 sm:p-4 md:p-6">No autorizado</div>;
  }

  return (
    <div>
      <TicketsCardsActivos tickets={tickets} loading={loading} />
    </div>
  );
}
