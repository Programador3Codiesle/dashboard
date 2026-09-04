'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { REPUESTOS_COPY } from '@/modules/repuestos/constants';
import { REPUESTOS_HUB_ITEMS } from '@/modules/repuestos/hub/items';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';

export function RepuestosHub() {
  const { blocked } = useRepuestosPageGuard();
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={REPUESTOS_COPY.hubTitle}
      description={REPUESTOS_COPY.hubDescription}
      items={REPUESTOS_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      filter={{
        permission: 'submenu',
        requiredEmpresaId: CODIESEL_EMPRESA_ID,
      }}
      emptyWhenFiltered
    />
  );
}
