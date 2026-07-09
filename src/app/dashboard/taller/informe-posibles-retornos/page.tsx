"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import {
  CODIESEL_EMPRESA_ID,
  INFORME_POSIBLES_RETORNOS_SUBMENU_ID,
} from "@/utils/constants";
import { InformePosiblesRetornosGestion } from "@/modules/taller/informe-posibles-retornos/components/InformePosiblesRetornosGestion";

export default function InformePosiblesRetornosPage() {
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
    if (!permitidos.has(INFORME_POSIBLES_RETORNOS_SUBMENU_ID)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router]);

  if (user && user.empresa !== CODIESEL_EMPRESA_ID) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Informe posibles retornos</h1>
        <p className="text-gray-500 mt-1">
          Comparativo mensual de entradas, retornos y posibles retornos
        </p>
      </div>
      <InformePosiblesRetornosGestion />
    </div>
  );
}
