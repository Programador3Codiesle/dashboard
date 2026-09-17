'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { isMissingListedPermission } from '@/utils/permission-ids';

type GuardOptions = {
  /** PHP whitelist de NITs (además del submenu). */
  allowedNits?: ReadonlySet<number>;
};

export function useAdministracionPageGuard(
  submenuId?: number,
  options?: GuardOptions,
) {
  const router = useRouter();
  const { user } = useAuth();
  const missingSubmenu =
    submenuId != null && isMissingListedPermission(user?.submenus_permitidos, submenuId);
  const nitUsuario =
    user?.nit_usuario != null ? Number(user.nit_usuario) : Number.NaN;
  const missingNit =
    options?.allowedNits != null &&
    (!Number.isFinite(nitUsuario) || !options.allowedNits.has(nitUsuario));

  useEffect(() => {
    if (!user) return;
    if (missingSubmenu || missingNit) {
      router.replace('/dashboard/administracion');
    }
  }, [user, router, missingSubmenu, missingNit]);

  const blocked = !!user && (missingSubmenu || missingNit);

  return { user, blocked };
}
