"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { isMissingListedPermission } from "@/utils/permission-ids";

export function useNominaPageGuard(submenuId?: number) {
  const router = useRouter();
  const { user } = useAuth();
  const missingSubmenu =
    submenuId != null &&
    isMissingListedPermission(user?.submenus_permitidos, submenuId);

  useEffect(() => {
    if (!user) return;
    if (missingSubmenu) {
      router.replace("/dashboard/nomina");
    }
  }, [user, router, missingSubmenu]);

  const blocked = !!user && missingSubmenu;

  return { user, blocked };
}
