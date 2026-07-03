"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { INFORME_OT_ABIERTAS_SUBMENU_ID } from "@/utils/constants";
import { InformeOtAbiertasTallerGestion } from "@/modules/taller/informe-ot-abiertas/components/InformeOtAbiertasTallerGestion";

export default function InformeOrdenesAbiertasTallerPage() {
  const router = useRouter();
  const params = useParams();
  const bodegaParam = typeof params.bodegaId === "string" ? params.bodegaId : "";
  const bodegaId = Number(bodegaParam);
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
    if (bodegaParam && (!Number.isFinite(bodegaId) || bodegaId <= 0)) {
      router.replace("/dashboard/taller/informe-ordenes-abiertas");
    }
  }, [bodegaParam, bodegaId, router]);

  if (!bodegaParam || !Number.isFinite(bodegaId) || bodegaId <= 0) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="app-title-xl brand-text">Informe órdenes taller abiertas</h1>
        <p className="text-gray-500 mt-1">Órdenes abiertas por asesor</p>
      </div>
      <InformeOtAbiertasTallerGestion bodegaId={bodegaId} />
    </div>
  );
}
