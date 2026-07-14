'use client';

import { SubmodulosHub } from '@/components/shared/hub/SubmodulosHub';
import { COTIZAR_HUB_ITEMS } from '@/modules/cotizar/hub/items';

export function CotizarHub() {
  return (
    <SubmodulosHub
      title="Cotizar"
      description="Gestiona todas las funcionalidades del cotizador (livianos, pesados, informes y configuración)."
      items={COTIZAR_HUB_ITEMS}
    />
  );
}
