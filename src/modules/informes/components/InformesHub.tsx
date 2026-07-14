'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { INFORMES_ROOT_HUB_ITEMS } from '@/modules/informes/hub/root-items';

export function InformesHub() {
  return (
    <SubmodulosHub
      title="Informes"
      description="Accede a los informes de Gestión Humana y Postventa con una experiencia moderna y unificada."
      items={INFORMES_ROOT_HUB_ITEMS}
    />
  );
}
