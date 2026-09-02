import { Users, Wrench } from 'lucide-react';
import type { HubItem } from '@/components/shared/hub/types';
import {
  INFORMES_GESTION_HUMANA_SUBMENU_ID,
  INFORMES_POSTVENTA_SUBMENU_ID,
} from '@/utils/constants';
import { INFORMES_COPY } from '@/modules/informes/constants';

export const INFORMES_ROOT_HUB_ITEMS: HubItem[] = [
  {
    id: 'gestion-humana',
    nombre: 'Gestión Humana',
    descripcion: INFORMES_COPY.ghHub.description,
    ruta: '/dashboard/informes/gestion-humana',
    submenuId: INFORMES_GESTION_HUMANA_SUBMENU_ID,
    icono: Users,
  },
  {
    id: 'postventa',
    nombre: 'Postventa',
    descripcion: INFORMES_COPY.pvHub.description,
    ruta: '/dashboard/informes/postventa',
    submenuId: INFORMES_POSTVENTA_SUBMENU_ID,
    icono: Wrench,
  },
];
