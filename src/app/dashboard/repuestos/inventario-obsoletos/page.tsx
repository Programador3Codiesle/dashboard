'use client';

import { INVENTARIO_OBSOLETOS_SUBMENU_ID } from '@/utils/constants';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { InventarioObsoletosGestion } from '@/modules/repuestos/inventario-obsoletos/components/InventarioObsoletosGestion';

export default function RepuestosInventarioObsoletosPage() {
  const { blocked } = useRepuestosPageGuard(INVENTARIO_OBSOLETOS_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Inventario Obsoletos
        </h1>
        <p className="text-gray-500 mt-1">
          Resumen del inventario obsoleto por categoría con detalle y simulación de descuentos.
        </p>
      </div>
      <InventarioObsoletosGestion />
    </div>
  );
}
