'use client';

import { AUDITORIA_CC_SUBMENU_ID } from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { AuditoriaIndexGestion } from '@/modules/contact-center/auditoria/components/AuditoriaIndexGestion';

export default function AuditoriaPage() {
  const { blocked } = useContactCenterPageGuard(AUDITORIA_CC_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Auditoría
        </h1>
        <p className="text-gray-500 mt-1">
          Crear y finalizar auditorías de agentes de contact center.
        </p>
      </div>
      <AuditoriaIndexGestion />
    </div>
  );
}
