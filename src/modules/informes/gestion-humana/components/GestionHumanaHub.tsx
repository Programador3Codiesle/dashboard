'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import {
  INFORMES_COPY,
} from '@/modules/informes/constants';
import { GESTION_HUMANA_HUB_ITEMS } from '@/modules/informes/gestion-humana/hub/items';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { INFORMES_GESTION_HUMANA_SUBMENU_ID } from '@/utils/constants';

export function GestionHumanaHub() {
  const { blocked } = useInformesPageGuard({
    submenuId: INFORMES_GESTION_HUMANA_SUBMENU_ID,
    redirectTo: '/dashboard/informes',
  });
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={INFORMES_COPY.ghHub.title}
      description={INFORMES_COPY.ghHub.description}
      items={GESTION_HUMANA_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3"
      filter={{ permission: 'trimenu' }}
      emptyWhenFiltered
    />
  );
}
