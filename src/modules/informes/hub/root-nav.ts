import type { HubNavItem } from '@/components/shared/hub/types';
import {
  CODIESEL_EMPRESA_ID,
  INFORME_QR_TALLER_SUBMENU_ID,
  INFORMES_GESTION_HUMANA_SUBMENU_ID,
  INFORMES_POSTVENTA_SUBMENU_ID,
} from '@/utils/constants';
import { INFORMES_COPY } from '@/modules/informes/constants';

export const INFORMES_ROOT_HUB_NAV: HubNavItem[] = [
  {
    id: 'gestion-humana',
    nombre: 'Gestión Humana',
    descripcion: INFORMES_COPY.ghHub.description,
    ruta: '/dashboard/informes/gestion-humana',
    submenuId: INFORMES_GESTION_HUMANA_SUBMENU_ID,
  },
  {
    id: 'postventa',
    nombre: 'Postventa',
    descripcion: INFORMES_COPY.pvHub.description,
    ruta: '/dashboard/informes/postventa',
    submenuId: INFORMES_POSTVENTA_SUBMENU_ID,
  },
  {
    id: 'qr-taller',
    nombre: INFORMES_COPY.qrTaller.title,
    descripcion: INFORMES_COPY.qrTaller.description,
    ruta: '/dashboard/informes/qr-taller',
    submenuId: INFORME_QR_TALLER_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
  },
];
