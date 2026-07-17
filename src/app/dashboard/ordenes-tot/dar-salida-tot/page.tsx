'use client';

import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';
import { DAR_SALIDA_TOT_SUBMENU_ID } from '@/utils/constants';
import { useOrdenesTotPageGuard } from '@/modules/ordenes-tot/shared/hooks/useOrdenesTotPageGuard';

const DarSalidaGestion = dynamic(
  () =>
    import('@/modules/ordenes-tot/dar-salida/components/DarSalidaGestion').then(
      (m) => m.DarSalidaGestion,
    ),
  { loading: () => <PageLoadingSkeleton /> },
);

export default function DarSalidaTotPage() {
  const { blocked } = useOrdenesTotPageGuard(DAR_SALIDA_TOT_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Dar salida TOT
        </h1>
        <p className="text-gray-500 mt-1">
          Registro de TOT, generación de recibo PDF y marcado de reingreso.
        </p>
      </div>
      <DarSalidaGestion tipo="tot" />
    </div>
  );
}
