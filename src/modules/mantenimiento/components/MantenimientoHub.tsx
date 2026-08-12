'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { MANTENIMIENTO_HUB_ITEMS } from '@/modules/mantenimiento/hub/items';

export function MantenimientoHub() {
  useMantenimientoPageGuard();

  return (
    <SubmodulosHub
      title="Mantenimiento"
      description="Equipos, correctivo, preventivo e informes"
      items={MANTENIMIENTO_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID, permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
