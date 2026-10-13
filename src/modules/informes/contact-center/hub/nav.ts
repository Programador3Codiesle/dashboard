import type { HubNavItem } from '@/components/shared/hub/types';
import { INFORMES_CC_TRIMENU, INFORMES_COPY } from '@/modules/informes/constants';

export const INFORMES_CONTACT_CENTER_HUB_NAV: HubNavItem[] = [
  {
    id: 'informe-leads',
    nombre: INFORMES_COPY.informeLeads.title,
    descripcion: INFORMES_COPY.informeLeads.description,
    ruta: '/dashboard/informes/contact-center/informe-leads',
    trimenuId: INFORMES_CC_TRIMENU.informeLeads,
  },
];
