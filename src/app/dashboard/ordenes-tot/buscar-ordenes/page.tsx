'use client';

import dynamic from 'next/dynamic';
import { PageLoadingSkeleton } from '@/components/shared/ui/PageLoadingSkeleton';
import { BUSCAR_ORDENES_SUBMENU_ID } from '@/utils/constants';
import { useOrdenesTotPageGuard } from '@/modules/ordenes-tot/shared/hooks/useOrdenesTotPageGuard';

const BuscarOrdenesGestion = dynamic(
  () =>
    import(
      '@/modules/ordenes-tot/buscar-ordenes/components/BuscarOrdenesGestion'
    ).then((m) => m.BuscarOrdenesGestion),
  { loading: () => <PageLoadingSkeleton /> },
);

export default function BuscarOrdenesPage() {
  const { blocked } = useOrdenesTotPageGuard(BUSCAR_ORDENES_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Buscar Órdenes
        </h1>
        <p className="text-gray-500 mt-1">
          Confirmación de salidas y reingresos en portería.
        </p>
      </div>
      <BuscarOrdenesGestion />
    </div>
  );
}
