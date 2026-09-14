'use client';

import TicketsTableFinalizados from './TicketsTableFinalizados';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { puedeVerTodosLosTickets } from '../constants';

export function TicketsFinalizadosGestion() {
  const { user } = useAuth();
  const { tickets, loading } = useTickets('finalizados');

  if (!puedeVerTodosLosTickets(user?.perfil_postventa)) {
    return <div className="p-3 sm:p-4 md:p-6">No autorizado</div>;
  }

  return (
    <div>
      <TicketsTableFinalizados tickets={tickets} loading={loading} />
    </div>
  );
}
