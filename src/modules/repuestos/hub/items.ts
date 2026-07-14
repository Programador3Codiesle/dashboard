import {
  ClipboardList,
  FileBarChart2,
  PackagePlus,
  ShoppingCart,
  TableProperties,
  Truck,
} from 'lucide-react';
import type { HubItem } from '@/components/shared/hub/types';
import {
  ENTRADAS_VARIAS_SUBMENU_ID,
  INFORME_EV_SV_SUBMENU_ID,
  INFORME_OBSOLETOS_SUBMENU_ID,
  INVENTARIO_OBSOLETOS_SUBMENU_ID,
  ORDEN_COMPRA_SUBMENU_ID,
  SOLICITUDES_EV_SUBMENU_ID,
} from '@/utils/constants';

export const REPUESTOS_HUB_ITEMS: HubItem[] = [
  {
    id: 'entradas-varias',
    nombre: 'Entradas Varias',
    descripcion: 'Crear solicitudes de entrada varia por orden de taller',
    ruta: '/dashboard/repuestos/entradas-varias',
    submenuId: ENTRADAS_VARIAS_SUBMENU_ID,
    icono: PackagePlus,
  },
  {
    id: 'solicitudes-ev',
    nombre: 'Gestión Entradas Varias',
    descripcion: 'Autorizar, registrar EV/SV y gestionar entregas de repuestos',
    ruta: '/dashboard/repuestos/solicitudes-ev',
    submenuId: SOLICITUDES_EV_SUBMENU_ID,
    icono: ClipboardList,
  },
  {
    id: 'informe-ev-sv',
    nombre: 'Informe EV/SV',
    descripcion: 'Informe de entradas varias y salidas varias por periodo',
    ruta: '/dashboard/repuestos/informe-ev-sv',
    submenuId: INFORME_EV_SV_SUBMENU_ID,
    icono: FileBarChart2,
  },
  {
    id: 'inventario-obsoletos',
    nombre: 'Inventario Obsoletos',
    descripcion: 'Consulta y gestión del inventario de repuestos obsoletos',
    ruta: '/dashboard/repuestos/inventario-obsoletos',
    submenuId: INVENTARIO_OBSOLETOS_SUBMENU_ID,
    icono: TableProperties,
  },
  {
    id: 'informe-obsoletos',
    nombre: 'Informe Obsoletos',
    descripcion: 'Informe analítico de repuestos obsoletos por bodega',
    ruta: '/dashboard/repuestos/informe-obsoletos',
    submenuId: INFORME_OBSOLETOS_SUBMENU_ID,
    icono: Truck,
  },
  {
    id: 'orden-compra',
    nombre: 'Orden de Compra',
    descripcion: 'Gestión de órdenes de compra de repuestos',
    ruta: '/dashboard/repuestos/orden-compra',
    submenuId: ORDEN_COMPRA_SUBMENU_ID,
    icono: ShoppingCart,
  },
];
