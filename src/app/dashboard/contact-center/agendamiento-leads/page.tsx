'use client';

import { AGENDAMIENTO_LEADS_SUBMENU_ID } from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { AgendamientoLeadsGestion } from '@/modules/contact-center/agendamiento-leads/components/AgendamientoLeadsGestion';

export default function AgendamientoLeadsPage() {
  const { blocked } = useContactCenterPageGuard(AGENDAMIENTO_LEADS_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Admin LEADS
        </h1>
        <p className="text-gray-500 mt-1">
          Asignación y gestión de leads de postventa con exportación a Excel.
        </p>
      </div>
      <AgendamientoLeadsGestion />
    </div>
  );
}
