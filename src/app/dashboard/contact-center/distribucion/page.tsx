'use client';

import { DISTRIBUCION_CC_SUBMENU_ID } from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { DistribucionGestion } from '@/modules/contact-center/distribucion/components/DistribucionGestion';

export default function DistribucionPage() {
  const { blocked } = useContactCenterPageGuard(DISTRIBUCION_CC_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Distribución
        </h1>
        <p className="text-gray-500 mt-1">
          Matriz de asignación agente por bodega con porcentajes de distribución.
        </p>
      </div>
      <DistribucionGestion />
    </div>
  );
}
