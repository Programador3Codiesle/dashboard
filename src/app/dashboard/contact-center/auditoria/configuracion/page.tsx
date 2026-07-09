'use client';

import { AUDITORIA_CC_SUBMENU_ID } from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { AuditoriaConfiguracionGestion } from '@/modules/contact-center/auditoria/components/AuditoriaConfiguracionGestion';

export default function AuditoriaConfiguracionPage() {
  const { blocked } = useContactCenterPageGuard(AUDITORIA_CC_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Configuración de auditoría
        </h1>
        <p className="text-gray-500 mt-1">
          Indicadores, items, observaciones y vista previa del formulario.
        </p>
      </div>
      <AuditoriaConfiguracionGestion />
    </div>
  );
}
