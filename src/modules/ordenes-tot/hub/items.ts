import {
  CarFront,
  ClipboardList,
  Package,
  Search,
} from 'lucide-react';
import type { HubItem } from '@/components/shared/hub/types';
import {
  BUSCAR_ORDENES_SUBMENU_ID,
  CODIESEL_EMPRESA_ID,
  DAR_SALIDA_TOT_SUBMENU_ID,
  DAR_SALIDA_VEHICULOS_SUBMENU_ID,
  INGRESO_REPUESTOS_SUBMENU_ID,
} from '@/utils/constants';

export const ORDENES_TOT_HUB_ITEMS: HubItem[] = [
  {
    id: 'dar-salida-vehiculos',
    nombre: 'Dar salida vehículos',
    descripcion: 'Registrar salida de vehículos pendientes de portería',
    ruta: '/dashboard/ordenes-tot/dar-salida-vehiculos',
    submenuId: DAR_SALIDA_VEHICULOS_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: CarFront,
  },
  {
    id: 'buscar-ordenes',
    nombre: 'Buscar Órdenes',
    descripcion: 'Confirmar salidas y reingresos en portería (tiempo real)',
    ruta: '/dashboard/ordenes-tot/buscar-ordenes',
    submenuId: BUSCAR_ORDENES_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: Search,
  },
  {
    id: 'dar-salida-tot',
    nombre: 'Dar salida TOT',
    descripcion: 'Registro de TOT, recibo PDF y marcado de reingreso',
    ruta: '/dashboard/ordenes-tot/dar-salida-tot',
    submenuId: DAR_SALIDA_TOT_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: ClipboardList,
  },
  {
    id: 'ingreso-repuestos',
    nombre: 'Ingreso Repuestos',
    descripcion: 'Candidatos a salida de repuestos por orden de taller',
    ruta: '/dashboard/ordenes-tot/ingreso-repuestos',
    submenuId: INGRESO_REPUESTOS_SUBMENU_ID,
    empresaId: CODIESEL_EMPRESA_ID,
    icono: Package,
  },
];
