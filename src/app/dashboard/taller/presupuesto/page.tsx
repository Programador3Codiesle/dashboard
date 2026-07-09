"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import {
  CODIESEL_EMPRESA_ID,
  PRESUPUESTO_SUBMENU_ID,
} from "@/utils/constants";
import { PresupuestoGestion } from "@/modules/taller/presupuesto/components/PresupuestoGestion";

export default function PresupuestoPage() {
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
    if (!permitidos.has(PRESUPUESTO_SUBMENU_ID)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router]);

  if (user && user.empresa !== CODIESEL_EMPRESA_ID) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Presupuesto</h1>
        <p className="text-gray-500 mt-1">
          Consulta y edición de presupuesto mensual por sede y categoría
        </p>
      </div>
      <PresupuestoGestion />
    </div>
  );
}
