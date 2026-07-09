'use client';

import { INFORME_BASE_DATOS_CC_SUBMENU_ID } from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { InformeBaseDatosGestion } from '@/modules/contact-center/informe-base-datos/components/InformeBaseDatosGestion';

export default function InformeBaseDatosPage() {
  const { blocked } = useContactCenterPageGuard(INFORME_BASE_DATOS_CC_SUBMENU_ID);
  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold brand-text tracking-tight">
          Bases de datos
        </h1>
        <p className="text-gray-500 mt-1">
          Informes de clientes por tiempo, kilometraje o fecha de entrega con exportación a Excel.
        </p>
      </div>
      <InformeBaseDatosGestion />
    </div>
  );
}
