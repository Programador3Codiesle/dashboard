import {
  BarChart3,
  Building2,
  CalendarDays,
  Car,
  ClipboardList,
  Factory,
  FileWarning,
  RotateCcw,
  UserCog,
  Wrench,
} from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { AUDITORIA_HUB_NAV } from './nav';

export const AUDITORIA_HUB_ITEMS = attachHubIcons(AUDITORIA_HUB_NAV, {
  'ranking-nps-tecnicos': BarChart3,
  'control-ordenes-diarias': CalendarDays,
  'retornos-por-sede': RotateCcw,
  'pqr': FileWarning,
  'nps-fabrica': Factory,
  'ordenes-mtto-preventivo': Wrench,
  'facturacion-taller': Building2,
  'facturacion-tecnico': UserCog,
  'ordenes-tecnicos': ClipboardList,
  'entregas': Car,
});
