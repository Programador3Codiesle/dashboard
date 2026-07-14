'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { NOMINA_HUB_ITEMS } from '@/modules/nomina/hub/items';

export function NominaHub() {
  return (
    <SubmodulosHub
      title="Nomina"
      description="Administra los submodulos de nomina y migra sus procesos desde legacy."
      items={NOMINA_HUB_ITEMS}
    />
  );
}
