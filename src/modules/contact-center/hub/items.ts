import {
  ClipboardCheck,
  Database,
  Grid3X3,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { CONTACT_CENTER_HUB_NAV } from './nav';

export const CONTACT_CENTER_HUB_ITEMS = attachHubIcons(CONTACT_CENTER_HUB_NAV, {
  'informe-base-datos': Database,
  'distribucion': Grid3X3,
  'distribucion-agente': UserCheck,
  'agendamiento-leads': PhoneCall,
  'auditoria': ClipboardCheck,
});
