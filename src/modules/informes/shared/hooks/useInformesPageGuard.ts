'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { isMissingListedPermission, toPermissionIdSet } from '@/utils/permission-ids';

type Options = {
  submenuId?: number;
  trimenuId?: number;
  trimenuIdsAlternativos?: number[];
  redirectTo?: string;
  /** false = la pantalla muestra el aviso de permiso en lugar de redirigir. */
  redirectOnDenied?: boolean;
};

export function useInformesPageGuard(options: Options = {}) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    submenuId,
    trimenuId,
    trimenuIdsAlternativos,
    redirectTo = '/dashboard/informes',
    redirectOnDenied = true,
  } = options;

  const submenus = user?.submenus_permitidos;
  const trimenus = user?.trimenus_permitidos;
  const trimenuSet = toPermissionIdSet(trimenus);

  const missingSubmenu =
    submenuId != null && isMissingListedPermission(submenus, submenuId);

  const trimenuOk =
    trimenuId == null ||
    !isMissingListedPermission(trimenus, trimenuId) ||
    (trimenuIdsAlternativos?.some((id) => trimenuSet.has(id)) ?? false);

  const blocked = !!user && (missingSubmenu || !trimenuOk);

  useEffect(() => {
    if (!user) return;
    if (blocked && redirectOnDenied) {
      router.replace(redirectTo);
    }
  }, [user, blocked, router, redirectTo, redirectOnDenied]);

  return { user, blocked };
}
