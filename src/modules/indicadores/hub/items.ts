import { Wallet } from 'lucide-react';
import type { HubItem } from '@/components/shared/hub/types';
import {
  CODIESEL_EMPRESA_ID,
  PRESUPUESTO_POSVENTA_SUBMENU_ID,
} from '@/utils/constants';

export const INDICADORES_HUB_ITEMS: HubItem[] = [
  {
    id: 'presupuesto-posventa',
    nombre: 'Presupuesto POSVENTA',
    descripcion: 'Indicadores de ventas y avance vs meta del mes',
    ruta: '/dashboard/indicadores/presupuesto-posventa',
    submenuId: PRESUPUESTO_POSVENTA_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: Wallet,
  },
];
