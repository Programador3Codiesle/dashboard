'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/core/auth/hooks/useAuth';

export function useChecklistPageGuard(submenuId?: number) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || submenuId == null) return;

    const hasSubmenuPermissions = Array.isArray(user.submenus_permitidos);
    if (!hasSubmenuPermissions) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(submenuId)) {
      router.replace('/dashboard/checklist');
    }
  }, [user, router, submenuId]);

  const blocked =
    !!user &&
    submenuId != null &&
    Array.isArray(user.submenus_permitidos) &&
    !user.submenus_permitidos.includes(submenuId);

  return { user, blocked };
}
