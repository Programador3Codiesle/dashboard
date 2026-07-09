'use client';

import { DISTRIBUCION_AGENTE_CC_SUBMENU_ID } from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { DistribucionAgenteGestion } from '@/modules/contact-center/distribucion-agente/components/DistribucionAgenteGestion';

export default function DistribucionAgentePage() {
  const { blocked } = useContactCenterPageGuard(DISTRIBUCION_AGENTE_CC_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Distribución Agentes
        </h1>
        <p className="text-gray-500 mt-1">
          Gestiones actuales, futuras y recordación del agente de contact center.
        </p>
      </div>
      <DistribucionAgenteGestion />
    </div>
  );
}
