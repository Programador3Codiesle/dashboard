'use client';

import { ENTRADAS_VARIAS_SUBMENU_ID } from '@/utils/constants';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { EntradasVariasGestion } from '@/modules/repuestos/entradas-varias/components/EntradasVariasGestion';

export default function EntradasVariasPage() {
  const { blocked } = useRepuestosPageGuard(ENTRADAS_VARIAS_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Solicitud de Entrada Varia
        </h1>
        <p className="text-gray-500 mt-1">
          Crear solicitudes de entrada varia asociadas a órdenes de taller.
        </p>
      </div>
      <EntradasVariasGestion />
    </div>
  );
}
