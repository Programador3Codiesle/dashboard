import type { IUser } from '@/types/global';
import { toPermissionIdSet } from '@/utils/permission-ids';
import type { HubFilterOptions, HubNavItem } from './types';

export { toPermissionIdSet } from '@/utils/permission-ids';

function nitUsuario(user: IUser | null): number {
  return user?.nit_usuario != null ? Number(user.nit_usuario) : Number.NaN;
}

function nitAutorizado(item: HubNavItem, user: IUser | null): boolean {
  if (!item.allowedNits) return true;
  const nit = nitUsuario(user);
  return Number.isFinite(nit) && item.allowedNits.has(nit);
}

function nitConAccesoDirecto(item: HubNavItem, user: IUser | null): boolean {
  if (!item.nitsConAcceso) return false;
  const nit = nitUsuario(user);
  return Number.isFinite(nit) && item.nitsConAcceso.has(nit);
}

export function filterHubItems<T extends HubNavItem>(
  items: T[],
  user: IUser | null,
  options: HubFilterOptions = {},
): T[] {
  if (options.requiredEmpresaId != null && user?.empresa !== options.requiredEmpresaId) {
    return [];
  }

  const permission = options.permission ?? 'submenu';

  if (permission === 'trimenu') {
    const mapped = items.filter((item) => typeof item.trimenuId === 'number');
    const hasPermissions = Array.isArray(user?.trimenus_permitidos);
    if (!hasPermissions) {
      return mapped.filter((item) => nitAutorizado(item, user));
    }

    const trimenusPermitidos = toPermissionIdSet(user?.trimenus_permitidos);
    return mapped.filter((item) => {
      if (!nitAutorizado(item, user)) return false;
      if (nitConAccesoDirecto(item, user)) return true;
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
      return nitAutorizado(item, user);
    });
  }

  const submenusPermitidos = toPermissionIdSet(user?.submenus_permitidos);
  return items.filter((item) => {
    if (!nitAutorizado(item, user)) return false;
    if (item.empresaId != null && user?.empresa !== item.empresaId) {
      return false;
    }
    if (item.sinSubmenu) {
      return true;
    }
    if (nitConAccesoDirecto(item, user)) {
      return true;
    }
    if (typeof item.submenuId !== 'number') {
      return false;
    }
    return submenusPermitidos.has(item.submenuId);
  });
}
