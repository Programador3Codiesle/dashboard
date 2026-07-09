'use client';

import { SOLICITUDES_EV_SUBMENU_ID } from '@/utils/constants';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { SolicitudesEvGestion } from '@/modules/repuestos/solicitudes-ev/components/SolicitudesEvGestion';

export default function RepuestosSolicitudesEvPage() {
  const { blocked } = useRepuestosPageGuard(SOLICITUDES_EV_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Gestión Entradas Varias
        </h1>
        <p className="text-gray-500 mt-1">
          Autorización, registro de EV/SV y entrega de repuestos por solicitud.
        </p>
      </div>
      <SolicitudesEvGestion />
    </div>
  );
}
