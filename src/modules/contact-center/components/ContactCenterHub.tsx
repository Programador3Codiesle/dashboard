'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { CONTACT_CENTER_HUB_ITEMS } from '@/modules/contact-center/hub/items';

export function ContactCenterHub() {
  useContactCenterPageGuard();

  return (
    <SubmodulosHub
      title="Contact Center"
      description="Distribución de agentes, leads, auditorías e informes de bases de datos"
      items={CONTACT_CENTER_HUB_ITEMS}
      variant="border"
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4"
      filter={{ requiredEmpresaId: CODIESEL_EMPRESA_ID }}
      emptyWhenFiltered
    />
  );
}
