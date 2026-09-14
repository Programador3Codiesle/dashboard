import {
  ClipboardList,
  FileSpreadsheet,
  QrCode,
  Star,
} from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { ENCUESTAS_HUB_NAV } from './nav';

export const ENCUESTAS_HUB_ITEMS = attachHubIcons(ENCUESTAS_HUB_NAV, {
  'satisfaccion': Star,
  'nps-colmotores': ClipboardList,
  'nps-tecnicos': FileSpreadsheet,
  'satisfaccion-qr': QrCode,
});
