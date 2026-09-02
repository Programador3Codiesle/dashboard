'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { ADMINISTRACION_HUB_ITEMS } from '@/modules/administracion/hub/items';

export function AdministracionHub() {
  return (
    <SubmodulosHub
      title={ADMINISTRACION_COPY.hub.title}
      description={ADMINISTRACION_COPY.hub.description}
      items={ADMINISTRACION_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 2xl:grid-cols-4 xl:gap-6"
      filter={{ permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
