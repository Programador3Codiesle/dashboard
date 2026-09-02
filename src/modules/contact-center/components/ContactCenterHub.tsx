'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CONTACT_CENTER_COPY } from '@/modules/contact-center/constants';
import { CONTACT_CENTER_HUB_ITEMS } from '@/modules/contact-center/hub/items';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';

export function ContactCenterHub() {
  const { blocked } = useContactCenterPageGuard();
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={CONTACT_CENTER_COPY.hub.title}
      description={CONTACT_CENTER_COPY.hub.description}
      items={CONTACT_CENTER_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      filter={{
        permission: 'submenu',
        requiredEmpresaId: CODIESEL_EMPRESA_ID,
      }}
      emptyWhenFiltered
    />
  );
}
