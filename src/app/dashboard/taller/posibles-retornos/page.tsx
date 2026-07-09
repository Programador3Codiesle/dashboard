"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import {
  CODIESEL_EMPRESA_ID,
  POSIBLES_RETORNOS_SUBMENU_ID,
} from "@/utils/constants";
import { PosiblesRetornosGestion } from "@/modules/taller/posibles-retornos/components/PosiblesRetornosGestion";

export default function PosiblesRetornosPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (user.empresa !== CODIESEL_EMPRESA_ID) {
      router.replace("/dashboard/taller");
      return;
    }

    const hasSubmenuPermissions = Array.isArray(user.submenus_permitidos);
    if (!hasSubmenuPermissions) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(POSIBLES_RETORNOS_SUBMENU_ID)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router]);

  if (user && user.empresa !== CODIESEL_EMPRESA_ID) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Posibles retornos</h1>
        <p className="text-gray-500 mt-1">
          Gestión y seguimiento de posibles retornos en taller
        </p>
      </div>
      <PosiblesRetornosGestion />
    </div>
  );
}
