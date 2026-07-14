'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { REPUESTOS_HUB_ITEMS } from '@/modules/repuestos/hub/items';

export function RepuestosHub() {
  useRepuestosPageGuard();

  return (
    <SubmodulosHub
      title="Repuestos"
      description="Gestión de entradas varias, inventario obsoleto y órdenes de compra"
      items={REPUESTOS_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID }}
      emptyWhenFiltered
    />
  );
}
