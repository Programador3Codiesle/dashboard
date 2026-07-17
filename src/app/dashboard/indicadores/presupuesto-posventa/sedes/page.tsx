'use client';

import { PRESUPUESTO_POSVENTA_SUBMENU_ID } from '@/utils/constants';
import { useIndicadoresPageGuard } from '@/modules/indicadores/shared/hooks/useIndicadoresPageGuard';
import { PresupuestoSedesGestion } from '@/modules/indicadores/presupuesto-posventa/components/PresupuestoSedesGestion';

export default function PresupuestoSedesPage() {
  const { blocked } = useIndicadoresPageGuard(PRESUPUESTO_POSVENTA_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight brand-text sm:text-3xl">
          Presupuesto por sedes
        </h1>
        <p className="mt-1 text-gray-500">
          Detalle de avance por sede (actualización cada 60 s).
        </p>
      </div>
      <PresupuestoSedesGestion />
    </div>
  );
}
