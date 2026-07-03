'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { ENTRADA_VEHICULO_SUBMENU_ID } from "@/utils/constants";
import { EntradaVehiculoGestion } from "@/modules/taller/entrada-vehiculo/components/EntradaVehiculoGestion";

export default function EntradaVehiculoPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions || !user) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(ENTRADA_VEHICULO_SUBMENU_ID)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Ingreso de vehículos</h1>
        <p className="text-gray-500 mt-1">
          Registro de entrada al taller, citas programadas y vehículos sin cita
        </p>
      </div>
      <EntradaVehiculoGestion />
    </div>
  );
}
