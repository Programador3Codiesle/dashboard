'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { GESTION_HUMANA_HUB_ITEMS } from '@/modules/informes/gestion-humana/hub/items';

export function GestionHumanaHub() {
  return (
    <SubmodulosHub
      title="Informes - Gestión Humana"
      description="Consulta y analiza la información de ausentismos, tiempo suplementario y otros indicadores de talento humano."
      items={GESTION_HUMANA_HUB_ITEMS}
      filter={{ permission: 'trimenu' }}
    />
  );
}
