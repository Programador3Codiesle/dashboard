import { QrCode, Users, Wrench } from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { INFORMES_ROOT_HUB_NAV } from './root-nav';

export const INFORMES_ROOT_HUB_ITEMS = attachHubIcons(INFORMES_ROOT_HUB_NAV, {
  'gestion-humana': Users,
  'postventa': Wrench,
  'qr-taller': QrCode,
});
