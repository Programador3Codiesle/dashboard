"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { isMissingListedPermission } from "@/utils/permission-ids";

export function useTallerPageGuard(
  submenuId?: number,
  requiredEmpresaId?: number,
) {
  const router = useRouter();
  const { user } = useAuth();
  const empresaMismatch =
    requiredEmpresaId != null && user?.empresa !== requiredEmpresaId;
  const missingSubmenu =
    submenuId != null &&
    isMissingListedPermission(user?.submenus_permitidos, submenuId);

  useEffect(() => {
    if (!user) return;

    if (empresaMismatch || missingSubmenu) {
      router.replace("/dashboard/taller");
    }
  }, [user, router, empresaMismatch, missingSubmenu]);

  const blocked = !!user && (empresaMismatch || missingSubmenu);

  return { user, blocked };
}
