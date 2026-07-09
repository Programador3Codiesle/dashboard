'use client';

import { INFORME_OBSOLETOS_SUBMENU_ID } from '@/utils/constants';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { InformeObsoletosGestion } from '@/modules/repuestos/informe-obsoletos/components/InformeObsoletosGestion';

export default function RepuestosInformeObsoletosPage() {
  const { blocked } = useRepuestosPageGuard(INFORME_OBSOLETOS_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Informe Obsoletos
        </h1>
        <p className="text-gray-500 mt-1">
          Consulta por rangos de meses y costo con exportación a Excel.
        </p>
      </div>
      <InformeObsoletosGestion />
    </div>
  );
}
