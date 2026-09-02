'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/hooks/useAuth';

type Options = {
  submenuId?: number;
  trimenuId?: number;
  trimenuIdsAlternativos?: number[];
  redirectTo?: string;
};

export function useInformesPageGuard(options: Options = {}) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    submenuId,
    trimenuId,
    trimenuIdsAlternativos,
    redirectTo = '/dashboard/informes',
  } = options;

  const submenus = user?.submenus_permitidos;
  const trimenus = user?.trimenus_permitidos;

  const missingSubmenu =
    submenuId != null &&
    Array.isArray(submenus) &&
    !submenus.includes(submenuId);

  const trimenuOk =
    trimenuId == null ||
    !Array.isArray(trimenus) ||
    trimenus.includes(trimenuId) ||
    (trimenuIdsAlternativos?.some((id) => trimenus.includes(id)) ?? false);

  const blocked = !!user && (missingSubmenu || !trimenuOk);

  useEffect(() => {
    if (!user) return;
    if (blocked) {
      router.replace(redirectTo);
    }
  }, [user, blocked, router, redirectTo]);

  return { user, blocked };
}
