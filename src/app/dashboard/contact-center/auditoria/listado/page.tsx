'use client';

import { AUDITORIA_CC_SUBMENU_ID } from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { AuditoriaListadoGestion } from '@/modules/contact-center/auditoria/components/AuditoriaListadoGestion';

export default function AuditoriaListadoPage() {
  const { blocked } = useContactCenterPageGuard(AUDITORIA_CC_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Informe de auditoría
        </h1>
        <p className="text-gray-500 mt-1">
          Listado de auditorías por agente con opción de ver detalle y enviar email.
        </p>
      </div>
      <AuditoriaListadoGestion />
    </div>
  );
}
