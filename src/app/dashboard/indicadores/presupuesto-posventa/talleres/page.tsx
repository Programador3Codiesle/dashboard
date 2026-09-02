import { Suspense } from 'react';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';
import { PresupuestoTalleresGestion } from '@/modules/indicadores/presupuesto-posventa/components/PresupuestoTalleresGestion';

export default function PresupuestoTalleresPage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <PresupuestoTalleresGestion />
    </Suspense>
  );
}
