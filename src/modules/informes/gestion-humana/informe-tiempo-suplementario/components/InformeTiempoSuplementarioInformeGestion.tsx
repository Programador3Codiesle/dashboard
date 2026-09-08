'use client';

import { InformeTiempoSuplementarioGestion } from '@/modules/administracion/informe-tiempo-suplementario/components/InformeTiempoSuplementarioGestion';
import { INFORMES_GH_TRIMENU } from '@/modules/informes/constants';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { INFORMES_GESTION_HUMANA_SUBMENU_ID } from '@/utils/constants';

export function InformeTiempoSuplementarioInformeGestion() {
  const { blocked } = useInformesPageGuard({
    submenuId: INFORMES_GESTION_HUMANA_SUBMENU_ID,
    trimenuId: INFORMES_GH_TRIMENU.tiempoSuplementario,
    redirectTo: '/dashboard/informes/gestion-humana',
  });
  if (blocked) return null;
  return <InformeTiempoSuplementarioGestion skipPageGuard />;
}
