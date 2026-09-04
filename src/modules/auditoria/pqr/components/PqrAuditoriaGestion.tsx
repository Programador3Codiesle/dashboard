'use client';

import PqrNpsPage from '@/app/dashboard/informes/postventa/pqr-nps/page';
import { AuditoriaPageFrame } from '@/modules/auditoria/components/AuditoriaPageFrame';
import { AUDITORIA_COPY } from '@/modules/auditoria/constants';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { PQR_AUDITORIA_SUBMENU_ID } from '@/utils/constants';

export function PqrAuditoriaGestion() {
  const { blocked } = useAuditoriaPageGuard(PQR_AUDITORIA_SUBMENU_ID);
  if (blocked) return null;
  return (
    <AuditoriaPageFrame backLabel={AUDITORIA_COPY.backLabel}>
      <div className="w-full min-w-0">
        <PqrNpsPage />
      </div>
    </AuditoriaPageFrame>
  );
}
