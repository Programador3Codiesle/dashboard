'use client';

import { ORDEN_COMPRA_SUBMENU_ID } from '@/utils/constants';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { OrdenCompraGestion } from '@/modules/repuestos/orden-compra/components/OrdenCompraGestion';

export default function RepuestosOrdenCompraPage() {
  const { blocked } = useRepuestosPageGuard(ORDEN_COMPRA_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Órdenes de Compra Repuestos
        </h1>
        <p className="text-gray-500 mt-1">
          Gestión de autorización, presupuesto y stock por sede.
        </p>
      </div>
      <OrdenCompraGestion />
    </div>
  );
}
