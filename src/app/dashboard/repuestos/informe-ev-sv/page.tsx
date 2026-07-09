'use client';

import { INFORME_EV_SV_SUBMENU_ID } from '@/utils/constants';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { InformeEvSvGestion } from '@/modules/repuestos/informe-ev-sv/components/InformeEvSvGestion';

export default function RepuestosInformeEvSvPage() {
  const { blocked } = useRepuestosPageGuard(INFORME_EV_SV_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Informe EV y SV
        </h1>
        <p className="text-gray-500 mt-1">
          Seguimiento de solicitudes con estados de gestión de repuestos y bodega.
        </p>
      </div>
      <InformeEvSvGestion />
    </div>
  );
}
