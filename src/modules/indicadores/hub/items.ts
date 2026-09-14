import { Wallet } from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { INDICADORES_HUB_NAV } from './nav';

export const INDICADORES_HUB_ITEMS = attachHubIcons(INDICADORES_HUB_NAV, {
  'presupuesto-posventa': Wallet,
});
