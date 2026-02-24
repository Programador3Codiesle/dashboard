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
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const handleMonthChange = useCallback(
    (value: string) => {
      setSelectedMonth(value);
    },
    []
  );

  const { data, isLoading, isFetching, error } = useDashboard(user?.id, {
    enabled: allowed,
    idsede: selectedIdsede,
    mes: (() => {
      if (!selectedMonth) return undefined;
      const [anoStr, mesStr] = selectedMonth.split("-");
      const val = Number(mesStr || 0);
      return Number.isFinite(val) && val > 0 ? val : undefined;
    })(),
    ano: (() => {
      if (!selectedMonth) return undefined;
      const [anoStr] = selectedMonth.split("-");
      const val = Number(anoStr || 0);
      return Number.isFinite(val) && val > 0 ? val : undefined;
    })(),
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

  const wrap = (
    children: React.ReactNode,
    withFilter = false,
    showLoading = false
  ) => (
    <div className="p-6 space-y-4 relative">
      {withFilter && (
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Dashboard Técnicos
          </h1>
          <div className="flex items-center gap-2">
            <label
              htmlFor="month-filter"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              Mes:
            </label>
            <input
              id="month-filter"
              type="month"
              className="rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
            />
          </div>
        </div>
      )}
      {showLoading && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-start justify-center pt-50 md:pt-80 rounded-lg overflow-hidden">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 font-medium">
              Cargando datos del mes seleccionado...
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );

  if (error) {
    return wrap(
      <p className="text-red-600">
        No se pudo cargar el dashboard. Intenta de nuevo.
      </p>
    );
  }

  if (isLoading || !data) {
    return wrap(<DashboardSkeleton />, false);
  }

  switch (data.variant) {
    case "jefe_taller":
      return wrap(<DashboardJefeTaller data={data as DJT} />);
    case "tecnicos":
      return wrap(
        <DashboardTecnicos data={data as DT} />,
        true,
        isFetching
      );
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
