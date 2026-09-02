'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { AUDITORIA_COPY } from '@/modules/auditoria/constants';
import { AUDITORIA_HUB_ITEMS } from '@/modules/auditoria/hub/items';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';

export function AuditoriaHub() {
  const { blocked } = useAuditoriaPageGuard();
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={AUDITORIA_COPY.hub.title}
      description={AUDITORIA_COPY.hub.description}
      items={AUDITORIA_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID, permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
