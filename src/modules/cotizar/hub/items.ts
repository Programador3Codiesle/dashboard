import {
  AlertTriangle,
  Car,
  ClipboardList,
  Edit3,
  FileBarChart,
  Layers,
  PlusCircle,
} from "lucide-react";
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { COTIZAR_HUB_NAV } from './nav';

export const COTIZAR_HUB_ITEMS = attachHubIcons(COTIZAR_HUB_NAV, {
  'livianos': Car,
  'informe-cotizaciones': FileBarChart,
  'ejecucion-cotizado-vs-facturado': Layers,
  'repuestos-no-disponibles': AlertTriangle,
  'control': ClipboardList,
  'adicionales-livianos': PlusCircle,
  'editar-repuesto-mano-obra': Edit3,
});
