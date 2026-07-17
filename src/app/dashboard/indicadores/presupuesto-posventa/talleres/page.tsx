'use client';

import { Suspense } from 'react';
import { PRESUPUESTO_POSVENTA_SUBMENU_ID } from '@/utils/constants';
import { useIndicadoresPageGuard } from '@/modules/indicadores/shared/hooks/useIndicadoresPageGuard';
import { PresupuestoTalleresGestion } from '@/modules/indicadores/presupuesto-posventa/components/PresupuestoTalleresGestion';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';

export default function PresupuestoTalleresPage() {
  const { blocked } = useIndicadoresPageGuard(PRESUPUESTO_POSVENTA_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight brand-text sm:text-3xl">
          Presupuesto por talleres
        </h1>
        <p className="mt-1 text-gray-500">
          Totales por taller (Diesel, Gasolina, Lámina y Pintura, Mostrador).
        </p>
      </div>
      <Suspense fallback={<PageLoadingSkeleton />}>
        <PresupuestoTalleresGestion />
      </Suspense>
    </div>
  );
}
