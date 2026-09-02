'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { INFORMES_COPY } from '@/modules/informes/constants';
import { INFORMES_ROOT_HUB_ITEMS } from '@/modules/informes/hub/root-items';

export function InformesHub() {
  return (
    <SubmodulosHub
      title={INFORMES_COPY.hub.title}
      description={INFORMES_COPY.hub.description}
      items={INFORMES_ROOT_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5"
      filter={{ permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
