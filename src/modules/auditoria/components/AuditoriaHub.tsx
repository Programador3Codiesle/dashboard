'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { AUDITORIA_HUB_ITEMS } from '@/modules/auditoria/hub/items';

export function AuditoriaHub() {
  useAuditoriaPageGuard();

  return (
    <SubmodulosHub
      title="Auditoría"
      description="Control de órdenes, facturación, NPS fábrica, PQR y entregas"
      items={AUDITORIA_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID, permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
