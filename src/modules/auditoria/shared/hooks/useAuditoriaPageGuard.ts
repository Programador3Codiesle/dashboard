'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';

export function useAuditoriaPageGuard(submenuId?: number) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (user.empresa !== CODIESEL_EMPRESA_ID) {
      router.replace('/dashboard');
      return;
    }

    if (submenuId == null) return;

    const hasSubmenuPermissions = Array.isArray(user.submenus_permitidos);
    if (!hasSubmenuPermissions) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(submenuId)) {
      router.replace('/dashboard/auditoria');
    }
  }, [user, router, submenuId]);

  const blocked =
    !!user &&
    (user.empresa !== CODIESEL_EMPRESA_ID ||
      (submenuId != null &&
        Array.isArray(user.submenus_permitidos) &&
        !user.submenus_permitidos.includes(submenuId)));

  return { user, blocked };
}
