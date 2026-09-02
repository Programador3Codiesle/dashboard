import { Suspense } from 'react';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';
import { PresupuestoTipoOperacionesGestion } from '@/modules/indicadores/presupuesto-posventa/components/PresupuestoTipoOperacionesGestion';

export default function PresupuestoTipoOperacionesPage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <PresupuestoTipoOperacionesGestion />
    </Suspense>
  );
}
