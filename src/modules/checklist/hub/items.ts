import {
  AlignVerticalJustifyCenter,
  Bike,
  Car,
  Flame,
  Paintbrush,
  Scissors,
  TowerControl,
  Truck,
  Wrench,
} from 'lucide-react';
import { attachHubIcons } from '@/components/shared/hub/attach-hub-icons';
import { CHECKLIST_HUB_NAV } from './nav';

export const CHECKLIST_HUB_ITEMS = attachHubIcons(CHECKLIST_HUB_NAV, {
  'motocicletas': Bike,
  'vehiculo': Car,
  'alineadores': AlignVerticalJustifyCenter,
  'elevadores': TowerControl,
  'hidraulicos': Wrench,
  'trabajo-caliente': Flame,
  'portico': Truck,
  'tijera': Scissors,
  'cabina-pintura': Paintbrush,
});
