'use client';

import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';

const DarSalidaGestion = dynamic(
  () =>
    import('@/modules/ordenes-tot/dar-salida/components/DarSalidaGestion').then(
      (module) => module.DarSalidaGestion,
    ),
  { loading: () => <PageLoadingSkeleton /> },
);

export function DarSalidaTotGestion() {
  return <DarSalidaGestion tipo="tot" />;
}
