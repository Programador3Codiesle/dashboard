'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { useEncuestasPageGuard } from '@/modules/encuestas/shared/hooks/useEncuestasPageGuard';
import { ENCUESTAS_HUB_ITEMS } from '@/modules/encuestas/hub/items';

export function EncuestasHub() {
  useEncuestasPageGuard();

  return (
    <SubmodulosHub
      title="Encuestas"
      description="Satisfacción, ingreso NPS Colmotores/Técnicos y encuesta QR de salida"
      items={ENCUESTAS_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID, permission: 'submenu' }}
      emptyWhenFiltered
    />
  );
}
