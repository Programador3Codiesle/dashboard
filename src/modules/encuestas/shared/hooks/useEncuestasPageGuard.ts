'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { isMissingListedPermission } from '@/utils/permission-ids';
import { CODIESEL_EMPRESA_ID } from '@/utils/constants';

export function useEncuestasPageGuard(
  submenuId?: number,
  options?: { redirectTo?: string },
) {
  const router = useRouter();
  const { user } = useAuth();
  const redirectTo = options?.redirectTo ?? '/dashboard/encuestas';
  const empresaOk = user?.empresa === CODIESEL_EMPRESA_ID;
  const missingSubmenu =
    submenuId != null && isMissingListedPermission(user?.submenus_permitidos, submenuId);

  useEffect(() => {
    if (!user) return;

    if (!empresaOk) {
      router.replace('/dashboard');
      return;
    }

    if (missingSubmenu) {
      router.replace(redirectTo);
    }
  }, [user, router, empresaOk, missingSubmenu, redirectTo]);

  const blocked = !!user && (!empresaOk || missingSubmenu);

  return { user, blocked };
}
