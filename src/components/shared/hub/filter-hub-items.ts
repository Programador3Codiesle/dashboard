import type { IUser } from '@/types/global';
import { toPermissionIdSet } from '@/utils/permission-ids';
import type { HubFilterOptions, HubItem } from './types';

export { toPermissionIdSet } from '@/utils/permission-ids';

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
    const mapped = items.filter((item) => typeof item.trimenuId === 'number');
    const hasPermissions = Array.isArray(user?.trimenus_permitidos);
    if (!hasPermissions) {
      return mapped;
    }

    const trimenusPermitidos = toPermissionIdSet(user?.trimenus_permitidos);
    return mapped.filter((item) => {
      const id = item.trimenuId;
      if (typeof id !== 'number') return false;
      if (trimenusPermitidos.has(id)) return true;
      return item.trimenuIdsAlternativos?.some((alt) => trimenusPermitidos.has(alt)) ?? false;
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

  const submenusPermitidos = toPermissionIdSet(user?.submenus_permitidos);
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
