import {
  ClipboardCheck,
  Database,
  Grid3X3,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import type { HubItem } from '@/components/shared/hub/types';
import {
  AGENDAMIENTO_LEADS_SUBMENU_ID,
  AUDITORIA_CC_SUBMENU_ID,
  DISTRIBUCION_AGENTE_CC_SUBMENU_ID,
  DISTRIBUCION_CC_SUBMENU_ID,
  INFORME_BASE_DATOS_CC_SUBMENU_ID,
} from '@/utils/constants';

export const CONTACT_CENTER_HUB_ITEMS: HubItem[] = [
  {
    id: 'informe-base-datos',
    nombre: 'Bases de datos',
    descripcion: 'Informes de clientes por tiempo, kilometraje o fecha de entrega',
    ruta: '/dashboard/contact-center/informe-base-datos',
    submenuId: INFORME_BASE_DATOS_CC_SUBMENU_ID,
    icono: Database,
  },
  {
    id: 'distribucion',
    nombre: 'Distribución',
    descripcion: 'Matriz de asignación agente por bodega con porcentajes',
    ruta: '/dashboard/contact-center/distribucion',
    submenuId: DISTRIBUCION_CC_SUBMENU_ID,
    icono: Grid3X3,
  },
  {
    id: 'distribucion-agente',
    nombre: 'Distribución Agentes',
    descripcion: 'Gestiones actuales, futuras y recordación del agente',
    ruta: '/dashboard/contact-center/distribucion-agente',
    submenuId: DISTRIBUCION_AGENTE_CC_SUBMENU_ID,
    icono: UserCheck,
  },
  {
    id: 'agendamiento-leads',
    nombre: 'Admin LEADS',
    descripcion: 'Asignación y gestión de leads de postventa',
    ruta: '/dashboard/contact-center/agendamiento-leads',
    submenuId: AGENDAMIENTO_LEADS_SUBMENU_ID,
    icono: PhoneCall,
  },
  {
    id: 'auditoria',
    nombre: 'Auditoría',
    descripcion: 'Auditorías de agentes, configuración e informes detallados',
    ruta: '/dashboard/contact-center/auditoria',
    submenuId: AUDITORIA_CC_SUBMENU_ID,
    icono: ClipboardCheck,
  },
];
