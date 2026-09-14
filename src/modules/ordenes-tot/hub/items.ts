import {
  CarFront,
  Clipboard,
  ClipboardList,
  Package,
  Search,
} from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { ORDENES_TOT_HUB_NAV } from './nav';

export const ORDENES_TOT_HUB_ITEMS = attachHubIcons(ORDENES_TOT_HUB_NAV, {
  'dar-salida-vehiculos': CarFront,
  'buscar-ordenes': Search,
  'dar-salida-tot': ClipboardList,
  'dar-salida-ordenes': Clipboard,
  'ingreso-repuestos': Package,
});
