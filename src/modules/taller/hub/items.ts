import {
  CarFront,
  ClipboardCheck,
  ClipboardList,
  FileBarChart2,
  Headphones,
  RotateCcw,
  Settings,
  Trophy,
  TrendingUp,
  Wallet,
  Wrench,
} from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { TALLER_HUB_NAV } from './nav';

export const TALLER_HUB_ITEMS = attachHubIcons(TALLER_HUB_NAV, {
  'estado-taller': ClipboardCheck,
  'informe-ordenes-abiertas': FileBarChart2,
  'informe-posibles-retornos': RotateCcw,
  'posibles-retornos': RotateCcw,
  'pyg-asesores-repuestos': TrendingUp,
  'pyg-tecnicos': TrendingUp,
  'ranking-trimestral': Trophy,
  'presupuesto': Wallet,
  'entrada-vehiculo': CarFront,
  'mpvi-admin': Settings,
  'mpvi-tecnicos': Wrench,
  'mpvi-jefe-taller': ClipboardList,
  'mpvi-contact': Headphones,
});
