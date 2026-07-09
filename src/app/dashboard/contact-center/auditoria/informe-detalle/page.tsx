'use client';

import { AUDITORIA_CC_SUBMENU_ID } from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { AuditoriaInformeDetalleGestion } from '@/modules/contact-center/auditoria/components/AuditoriaInformeDetalleGestion';

export default function AuditoriaInformeDetallePage() {
  const { blocked } = useContactCenterPageGuard(AUDITORIA_CC_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Informe detallado de auditoría
        </h1>
        <p className="text-gray-500 mt-1">
          Consulta de auditorías por agente y mes con detalle de puntuación.
        </p>
      </div>
      <AuditoriaInformeDetalleGestion />
    </div>
  );
}
