"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { useDashboard } from "@/modules/dashboard/hooks/useDashboard";
import { isDashboardAllowedPerfil } from "@/modules/dashboard/constants";
import {
  DashboardJefeTaller,
  DashboardTecnicos,
  DashboardAdmin,
  DashboardAgenteCC,
  DashboardGerencia,
  DashboardCompras,
  DashboardAsesorRep,
  DashboardInformeMto,
  DashboardEmpty,
  DashboardSkeleton,
} from "@/modules/dashboard/components";
import type {
  DashboardJefeTaller as DJT,
  DashboardTecnicos as DT,
  DashboardAdmin as DA,
  DashboardAgenteCC as DACC,
  DashboardGerencia as DG,
  DashboardCompras as DC,
  DashboardAsesorRep as DAR,
  DashboardInformeMto as DIM,
} from "@/modules/dashboard/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const allowed = isDashboardAllowedPerfil(user?.perfil_postventa);
  const [selectedIdsede, setSelectedIdsede] = useState<number | undefined>(undefined);
  const { data, isLoading, error } = useDashboard(user?.id, {
    enabled: allowed,
    idsede: selectedIdsede,
  });
  const onSedeChange = useCallback((idsede: number) => {
    setSelectedIdsede(idsede);
  }, []);

  if (!user) {
    return (
      <div className="p-6 text-gray-500">
        Inicia sesión para ver el dashboard.
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="p-6">
        <DashboardEmpty />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        No se pudo cargar el dashboard. Intenta de nuevo.
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const wrap = (children: React.ReactNode) => (
    <div className="p-6">{children}</div>
  );

  switch (data.variant) {
    case "jefe_taller":
      return wrap(<DashboardJefeTaller data={data as DJT} />);
    case "tecnicos":
      return wrap(<DashboardTecnicos data={data as DT} />);
    case "admin":
      return wrap(<DashboardAdmin data={data as DA} />);
    case "agente_cc":
      return wrap(<DashboardAgenteCC data={data as DACC} />);
    case "gerencia":
      return wrap(<DashboardGerencia data={data as DG} />);
    case "compras":
      return wrap(<DashboardCompras data={data as DC} />);
    case "asesor_rep": {
      const asesorData = data as DAR;
      const sedes = asesorData.sedes;
      const activeIdsede = selectedIdsede ?? sedes?.[0]?.idsede;
      return wrap(
        <DashboardAsesorRep
          data={asesorData}
          sedes={sedes}
          selectedIdsede={activeIdsede}
          onSedeChange={onSedeChange}
        />
      );
    }
    case "informe_mto":
      return wrap(<DashboardInformeMto data={data as DIM} />);
    default:
      return wrap(<DashboardAdmin data={data as DA} />);
  }
}
