'use client';

import { INGRESO_REPUESTOS_SUBMENU_ID } from '@/utils/constants';
import { useOrdenesTotPageGuard } from '@/modules/ordenes-tot/shared/hooks/useOrdenesTotPageGuard';
import { DarSalidaGestion } from '@/modules/ordenes-tot/dar-salida/components/DarSalidaGestion';

export default function IngresoRepuestosPage() {
  const { blocked } = useOrdenesTotPageGuard(INGRESO_REPUESTOS_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Ingreso Repuestos
        </h1>
        <p className="text-gray-500 mt-1">
          Candidatos a salida de repuestos y registro (paridad con legacy).
        </p>
      </div>
      <DarSalidaGestion tipo="repuesto" />
    </div>
  );
}
