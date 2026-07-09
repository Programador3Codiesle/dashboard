"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { PYG_ASESORES_REPUESTOS_SUBMENU_ID } from "@/utils/constants";
import { PygAsesoresRepuestosGestion } from "@/modules/taller/pyg-asesores-repuestos/components/PygAsesoresRepuestosGestion";

export default function PygAsesoresRepuestosPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions || !user) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(PYG_ASESORES_REPUESTOS_SUBMENU_ID)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">P&G Asesores de Repuestos</h1>
        <p className="text-gray-500 mt-1">
          Informe de utilidades por asesor de repuestos con comparación anual
        </p>
      </div>
      <PygAsesoresRepuestosGestion />
    </div>
  );
}
