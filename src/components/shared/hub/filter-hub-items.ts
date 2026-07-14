import type { IUser } from '@/types/global';
import type { HubFilterOptions, HubItem } from './types';

export function filterHubItems(
  items: HubItem[],
  user: IUser | null,
  options: HubFilterOptions = {},
): HubItem[] {
  if (options.requiredEmpresaId != null && user?.empresa !== options.requiredEmpresaId) {
    return [];
  }

  const permission = options.permission ?? 'submenu';

  if (permission === 'trimenu') {
    const hasPermissions = Array.isArray(user?.trimenus_permitidos);
    if (!hasPermissions) {
      return items;
    }

    const trimenusPermitidos = new Set(user?.trimenus_permitidos || []);
    return items.filter((item) => {
      if (typeof item.trimenuId === 'number' && trimenusPermitidos.has(item.trimenuId)) {
        return true;
      }
      return item.trimenuIdsAlternativos?.some((id) => trimenusPermitidos.has(id)) ?? false;
    });
  }

  const hasPermissions = Array.isArray(user?.submenus_permitidos);
  if (!hasPermissions) {
    return items.filter((item) => {
      if (item.empresaId != null && user?.empresa !== item.empresaId) {
        return false;
      }
      return true;
    });
  }

  const submenusPermitidos = new Set(user?.submenus_permitidos || []);
  return items.filter((item) => {
    if (item.empresaId != null && user?.empresa !== item.empresaId) {
      return false;
    }
    if (typeof item.submenuId !== 'number') {
      return false;
    }
    return submenusPermitidos.has(item.submenuId);
  });
}
