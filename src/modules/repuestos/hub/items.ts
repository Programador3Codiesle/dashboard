import {
  ClipboardList,
  FileBarChart2,
  ListOrdered,
  PackagePlus,
  ShoppingCart,
  TableProperties,
  Truck,
} from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { REPUESTOS_HUB_NAV } from './nav';

export const REPUESTOS_HUB_ITEMS = attachHubIcons(REPUESTOS_HUB_NAV, {
  'entradas-varias': PackagePlus,
  'solicitudes-ev': ClipboardList,
  'informe-ev-sv': FileBarChart2,
  'inventario-obsoletos': TableProperties,
  'informe-obsoletos': Truck,
  'orden-compra': ShoppingCart,
  'pedidos-repuestos': ListOrdered,
});
