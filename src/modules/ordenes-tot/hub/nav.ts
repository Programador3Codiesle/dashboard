import type { HubNavItem } from '@/components/shared/hub/types';
import {
  BUSCAR_ORDENES_SUBMENU_ID,
  CODIESEL_EMPRESA_ID,
  DAR_SALIDA_ORDEN_GENERAL_SUBMENU_ID,
  DAR_SALIDA_TOT_SUBMENU_ID,
  DAR_SALIDA_VEHICULOS_SUBMENU_ID,
  INGRESO_REPUESTOS_SUBMENU_ID,
} from '@/utils/constants';

export const ORDENES_TOT_HUB_NAV: HubNavItem[] = [
  {
    id: 'dar-salida-vehiculos',
    nombre: 'Dar salida vehículos',
    descripcion: 'Registrar salida de vehículos pendientes de portería',
    ruta: '/dashboard/ordenes-tot/dar-salida-vehiculos',
    submenuId: DAR_SALIDA_VEHICULOS_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
  },
  {
    id: 'buscar-ordenes',
    nombre: 'Buscar Órdenes',
    descripcion: 'Confirmar salidas y reingresos en portería (tiempo real)',
    ruta: '/dashboard/ordenes-tot/buscar-ordenes',
    submenuId: BUSCAR_ORDENES_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
  },
  {
    id: 'dar-salida-tot',
    nombre: 'Dar salida TOT',
    descripcion: 'Registro de TOT, recibo PDF y marcado de reingreso',
    ruta: '/dashboard/ordenes-tot/dar-salida-tot',
    submenuId: DAR_SALIDA_TOT_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
  },
  {
    id: 'dar-salida-ordenes',
    nombre: 'Dar salida Órdenes',
    descripcion: 'Registro de órdenes generales pendientes de portería',
    ruta: '/dashboard/ordenes-tot/dar-salida-ordenes',
    submenuId: DAR_SALIDA_ORDEN_GENERAL_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
  },
  {
    id: 'ingreso-repuestos',
    nombre: 'Ingreso Repuestos',
    descripcion: 'Candidatos a salida de repuestos por orden de taller',
    ruta: '/dashboard/ordenes-tot/ingreso-repuestos',
    submenuId: INGRESO_REPUESTOS_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
  },
];
