'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { ENCUESTAS_COPY } from '@/modules/encuestas/constants';
import { ENCUESTAS_HUB_ITEMS } from '@/modules/encuestas/hub/items';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';

export function EncuestasHub() {
  const { blocked } = useEncuestasPageGuard();
  if (blocked) return null;

  return (
    <SubmodulosHub
      title={ENCUESTAS_COPY.hub.title}
      description={ENCUESTAS_COPY.hub.description}
      items={ENCUESTAS_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID, permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
