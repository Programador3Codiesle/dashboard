'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { useOrdenesTotPageGuard } from '@/modules/ordenes-tot/shared/hooks/useOrdenesTotPageGuard';
import { ORDENES_TOT_HUB_ITEMS } from '@/modules/ordenes-tot/hub/items';

export function OrdenesTotHub() {
  useOrdenesTotPageGuard();

  return (
    <SubmodulosHub
      title="Órdenes & TOT"
      description="Salida de vehículos y TOT, portería, repuestos y semáforo de taller"
      items={ORDENES_TOT_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID, permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
