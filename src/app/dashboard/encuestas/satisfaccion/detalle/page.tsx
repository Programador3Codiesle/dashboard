import { Suspense } from 'react';
import { SatisfaccionDetalleGestion } from '@/modules/encuestas/satisfaccion/components/SatisfaccionDetalleGestion';

export default function SatisfaccionDetallePage() {
  return (
    <Suspense fallback={<p className="p-4 text-muted-foreground">Cargando...</p>}>
      <SatisfaccionDetalleGestion />
    </Suspense>
  );
}
