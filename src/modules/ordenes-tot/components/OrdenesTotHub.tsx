'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { ORDENES_TOT_COPY } from '@/modules/ordenes-tot/constants';
import { ORDENES_TOT_HUB_ITEMS } from '@/modules/ordenes-tot/hub/items';
import { useOrdenesTotPageGuard } from '@/modules/ordenes-tot/shared/hooks/useOrdenesTotPageGuard';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';

export function OrdenesTotHub() {
  const { blocked } = useOrdenesTotPageGuard();
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={ORDENES_TOT_COPY.hub.title}
      description={ORDENES_TOT_COPY.hub.description}
      items={ORDENES_TOT_HUB_ITEMS}
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
