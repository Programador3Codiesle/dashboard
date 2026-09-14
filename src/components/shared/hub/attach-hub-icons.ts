import type { LucideIcon } from 'lucide-react';
import type { HubItem, HubNavItem } from './types';

export function attachHubIcons(
  nav: readonly HubNavItem[],
  icons: Record<string, LucideIcon>,
): HubItem[] {
  return nav.map((item) => {
    const icono = icons[item.id];
    if (!icono) {
      throw new Error(`Falta icono de hub para id="${item.id}"`);
    }
    return { ...item, icono };
  });
}
