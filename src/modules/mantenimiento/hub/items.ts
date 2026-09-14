import {
  CalendarDays,
  ClipboardList,
  FileBarChart2,
  HardHat,
  Wrench,
} from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { MANTENIMIENTO_HUB_NAV } from './nav';

export const MANTENIMIENTO_HUB_ITEMS = attachHubIcons(MANTENIMIENTO_HUB_NAV, {
  'equipos': HardHat,
  'mtto-correctivo': Wrench,
  'mtto-preventivo': CalendarDays,
  'informe-correctivo': FileBarChart2,
  'informe-preventivo': ClipboardList,
});
