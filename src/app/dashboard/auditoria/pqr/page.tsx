'use client';

import Link from 'next/link';
import PqrNpsPage from '@/app/dashboard/informes/postventa/pqr-nps/page';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { PQR_AUDITORIA_SUBMENU_ID } from '@/utils/constants';

export default function PqrAuditoriaPage() {
  const { blocked } = useAuditoriaPageGuard(PQR_AUDITORIA_SUBMENU_ID);
  if (blocked) return null;
  return (
    <div className="space-y-3">
      <Link
        href="/dashboard/auditoria"
        className="text-sm text-amber-700 hover:underline"
      >
        ← Volver a Auditoría
      </Link>
      <PqrNpsPage />
    </div>
  );
}
