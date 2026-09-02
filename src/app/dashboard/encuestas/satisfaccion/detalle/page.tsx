import { Suspense } from 'react';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';
import { SatisfaccionDetalleGestion } from '@/modules/encuestas/satisfaccion/components/SatisfaccionDetalleGestion';

export default function SatisfaccionDetallePage() {
  return (
    <Suspense fallback={<PageLoadingSkeleton />}>
      <SatisfaccionDetalleGestion />
    </Suspense>
  );
}
