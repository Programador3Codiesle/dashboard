'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { POSTVENTA_HUB_ITEMS } from '@/modules/informes/postventa/hub/items';

export function PostventaHub() {
  return (
    <SubmodulosHub
      title="Informes - Postventa"
      description="Visualiza los principales informes operativos y de satisfacción del módulo de Postventa."
      items={POSTVENTA_HUB_ITEMS}
      filter={{ permission: 'trimenu' }}
    />
  );
}
