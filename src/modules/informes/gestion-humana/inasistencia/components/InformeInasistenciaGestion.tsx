'use client';

import { InasistenciaGestion } from '@/modules/administracion/inasistencia/components/InasistenciaGestion';
import { INFORMES_GH_TRIMENU } from '@/modules/informes/constants';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { INFORMES_GESTION_HUMANA_SUBMENU_ID } from '@/utils/constants';

export function InformeInasistenciaGestion() {
  const { blocked } = useInformesPageGuard({
    submenuId: INFORMES_GESTION_HUMANA_SUBMENU_ID,
    trimenuId: INFORMES_GH_TRIMENU.inasistencia,
    redirectTo: '/dashboard/informes/gestion-humana',
  });
  if (blocked) return null;
  return <InasistenciaGestion skipPageGuard />;
}
