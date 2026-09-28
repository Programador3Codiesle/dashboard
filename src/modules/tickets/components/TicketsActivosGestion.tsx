'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTickets } from '../hooks/useTickets';
import TicketsCardsActivos from './TicketsCardsActivos';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { TICKETS_ROUTES, puedeVerTodosLosTickets } from '../constants';

export function TicketsActivosGestion() {
  const { user } = useAuth();
  const router = useRouter();
  const permitido = puedeVerTodosLosTickets(user?.perfil_postventa);
  const { tickets, loading } = useTickets('activos', 1, undefined, !!user && permitido);

  useEffect(() => {
    if (user && !permitido) {
      router.replace(TICKETS_ROUTES.mis);
    }
  }, [user, permitido, router]);

  if (!user || !permitido) {
    return null;
  }

  return (
    <div>
      <TicketsCardsActivos tickets={tickets} loading={loading} />
    </div>
  );
}
