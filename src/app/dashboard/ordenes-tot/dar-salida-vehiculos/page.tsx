'use client';

import { DAR_SALIDA_VEHICULOS_SUBMENU_ID } from '@/utils/constants';
import { useOrdenesTotPageGuard } from '@/modules/ordenes-tot/shared/hooks/useOrdenesTotPageGuard';
import { DarSalidaGestion } from '@/modules/ordenes-tot/dar-salida/components/DarSalidaGestion';

export default function DarSalidaVehiculosPage() {
  const { blocked } = useOrdenesTotPageGuard(DAR_SALIDA_VEHICULOS_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Dar salida vehículos
        </h1>
        <p className="text-gray-500 mt-1">
          Registro de salida de vehículos pendientes de confirmación en portería.
        </p>
      </div>
      <DarSalidaGestion tipo="vehiculo" />
    </div>
  );
}
