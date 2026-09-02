"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";

export function useTallerPageGuard(
  submenuId?: number,
  requiredEmpresaId?: number,
) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (requiredEmpresaId != null && user.empresa !== requiredEmpresaId) {
      router.replace("/dashboard/taller");
      return;
    }

    if (submenuId == null) return;

    const hasSubmenuPermissions = Array.isArray(user.submenus_permitidos);
    if (!hasSubmenuPermissions) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(submenuId)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router, submenuId, requiredEmpresaId]);

  const blocked =
    !!user &&
    ((requiredEmpresaId != null && user.empresa !== requiredEmpresaId) ||
      (submenuId != null &&
        Array.isArray(user.submenus_permitidos) &&
        !user.submenus_permitidos.includes(submenuId)));

  return { user, blocked };
}
