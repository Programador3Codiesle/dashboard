'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { MANTENIMIENTO_COPY } from '@/modules/mantenimiento/constants';
import { useMantenimientoPageGuard } from '@/modules/mantenimiento/shared/hooks/useMantenimientoPageGuard';
import { MANTENIMIENTO_HUB_ITEMS } from '@/modules/mantenimiento/hub/items';

export function MantenimientoHub() {
  const { blocked } = useMantenimientoPageGuard();
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={MANTENIMIENTO_COPY.hub.title}
      description={MANTENIMIENTO_COPY.hub.description}
      items={MANTENIMIENTO_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID, permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
