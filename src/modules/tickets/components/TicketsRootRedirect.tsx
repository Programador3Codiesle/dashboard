'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { TICKETS_ROUTES, puedeVerTodosLosTickets } from '../constants';

export function TicketsRootRedirect() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const canSeeAllTickets = puedeVerTodosLosTickets(user.perfil_postventa);
      if (canSeeAllTickets) {
        router.replace(TICKETS_ROUTES.activos);
      } else {
        router.replace(TICKETS_ROUTES.mis);
      }
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
