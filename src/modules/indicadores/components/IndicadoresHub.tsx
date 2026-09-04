'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { INDICADORES_COPY } from '@/modules/indicadores/constants';
import { INDICADORES_HUB_ITEMS } from '@/modules/indicadores/hub/items';
import { useIndicadoresPageGuard } from '@/modules/indicadores/shared/hooks/useIndicadoresPageGuard';

export function IndicadoresHub() {
  const { blocked } = useIndicadoresPageGuard();
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={INDICADORES_COPY.hub.title}
      description={INDICADORES_COPY.hub.description}
      items={INDICADORES_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID, permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
