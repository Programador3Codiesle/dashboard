import { Suspense } from 'react';
import { SolicitudesEvGestion } from '@/modules/repuestos/solicitudes-ev/components/SolicitudesEvGestion';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SolicitudesEvGestion />
    </Suspense>
  );
}
