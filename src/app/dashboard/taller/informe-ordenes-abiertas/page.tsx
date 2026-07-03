"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { INFORME_OT_ABIERTAS_SUBMENU_ID } from "@/utils/constants";
import { InformeOtAbiertasGeneralGestion } from "@/modules/taller/informe-ot-abiertas/components/InformeOtAbiertasGeneralGestion";

export default function InformeOrdenesAbiertasPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions || !user) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(INFORME_OT_ABIERTAS_SUBMENU_ID)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Informe órdenes taller abiertas</h1>
        <p className="text-gray-500 mt-1">
          Resumen por sede y detalle de órdenes de trabajo abiertas
        </p>
      </div>
      <InformeOtAbiertasGeneralGestion />
    </div>
  );
}
