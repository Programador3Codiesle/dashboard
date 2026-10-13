import { FileBarChart2 } from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { INFORMES_CONTACT_CENTER_HUB_NAV } from './nav';

export const INFORMES_CONTACT_CENTER_HUB_ITEMS = attachHubIcons(
  INFORMES_CONTACT_CENTER_HUB_NAV,
  {
    'informe-leads': FileBarChart2,
  },
);
