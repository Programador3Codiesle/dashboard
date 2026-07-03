'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { ESTADO_TALLER_SUBMENU_ID } from "@/utils/constants";
import { EstadoTallerGestion } from "@/modules/taller/estado-taller/components/EstadoTallerGestion";

export default function EstadoTallerPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions || !user) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(ESTADO_TALLER_SUBMENU_ID)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Estado taller</h1>
        <p className="text-gray-500 mt-1">
          Órdenes de trabajo abiertas, seguimiento y gestión por bodega
        </p>
      </div>
      <EstadoTallerGestion />
    </div>
  );
}
