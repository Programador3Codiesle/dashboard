"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { PYG_TECNICOS_SUBMENU_ID } from "@/utils/constants";
import { PygTecnicosGestion } from "@/modules/taller/pyg-tecnicos/components/PygTecnicosGestion";

export default function PygTecnicosPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions || !user) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(PYG_TECNICOS_SUBMENU_ID)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">P&G Técnicos</h1>
        <p className="text-gray-500 mt-1">
          Informe de utilidades por técnico con comparación anual
        </p>
      </div>
      <PygTecnicosGestion />
    </div>
  );
}
