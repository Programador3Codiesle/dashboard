'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { INFORMES_COPY } from '@/modules/informes/constants';
import { INFORMES_CONTACT_CENTER_HUB_ITEMS } from '@/modules/informes/contact-center/hub/items';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';
import { INFORMES_CONTACT_CENTER_SUBMENU_ID } from '@/utils/constants';

export function InformesContactCenterHub() {
  const { blocked } = useInformesPageGuard({
    submenuId: INFORMES_CONTACT_CENTER_SUBMENU_ID,
    redirectTo: '/dashboard/informes',
  });
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={INFORMES_COPY.ccHub.title}
      description={INFORMES_COPY.ccHub.description}
      items={INFORMES_CONTACT_CENTER_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      filter={{ permission: 'trimenu' }}
      emptyWhenFiltered
    />
  );
}
