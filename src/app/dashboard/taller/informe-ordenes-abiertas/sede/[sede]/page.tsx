"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { INFORME_OT_ABIERTAS_SUBMENU_ID } from "@/utils/constants";
import { InformeOtAbiertasSedeGestion } from "@/modules/taller/informe-ot-abiertas/components/InformeOtAbiertasSedeGestion";
import { isSedeKey } from "@/modules/taller/informe-ot-abiertas/types/informe-ot-abiertas.types";

export default function InformeOrdenesAbiertasSedePage() {
  const router = useRouter();
  const params = useParams();
  const sedeParam = typeof params.sede === "string" ? params.sede : "";
  const { user } = useAuth();

  useEffect(() => {
    const hasSubmenuPermissions = Array.isArray(user?.submenus_permitidos);
    if (!hasSubmenuPermissions || !user) return;

    const permitidos = new Set(user.submenus_permitidos);
    if (!permitidos.has(INFORME_OT_ABIERTAS_SUBMENU_ID)) {
      router.replace("/dashboard/taller");
    }
  }, [user, router]);

  useEffect(() => {
    if (sedeParam && !isSedeKey(sedeParam)) {
      router.replace("/dashboard/taller/informe-ordenes-abiertas");
    }
  }, [sedeParam, router]);

  if (!sedeParam || !isSedeKey(sedeParam)) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Informe órdenes taller abiertas</h1>
        <p className="text-gray-500 mt-1">Detalle por sede y bodegas</p>
      </div>
      <InformeOtAbiertasSedeGestion sede={sedeParam} />
    </div>
  );
}
