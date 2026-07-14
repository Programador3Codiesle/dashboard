'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { ADMINISTRACION_HUB_ITEMS } from '@/modules/administracion/hub/items';

export function AdministracionHub() {
  return (
    <SubmodulosHub
      title="Administración"
      description="Gestiona todos los módulos administrativos de la empresa"
      items={ADMINISTRACION_HUB_ITEMS}
      titleClassName="app-title-xl brand-text"
      gridClassName="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 2xl:grid-cols-4 xl:gap-6"
    />
  );
}
