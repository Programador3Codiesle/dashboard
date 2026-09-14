import type { HubNavItem } from '@/components/shared/hub/types';
import {
  CODIESEL_EMPRESA_ID,
  PRESUPUESTO_POSVENTA_SUBMENU_ID,
} from '@/utils/constants';

export const INDICADORES_HUB_NAV: HubNavItem[] = [
  {
    id: 'presupuesto-posventa',
    nombre: 'Presupuesto POSVENTA',
    descripcion: 'Indicadores de ventas y avance vs meta del mes',
    ruta: '/dashboard/indicadores/presupuesto-posventa',
    submenuId: PRESUPUESTO_POSVENTA_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
  },
];
