"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import {
  isDashboardAllowedPerfil,
  currentYearMonthValue,
  parseYearMonth,
  DASHBOARD_COPY,
  DASHBOARD_STYLES,
} from "../constants";
import { DashboardEmpty } from "./DashboardEmpty";
import type {
  DashboardJefeTaller as DJT,
  DashboardTecnicos as DT,
  DashboardAdmin as DA,
  DashboardAgenteCC as DACC,
  DashboardGerencia as DG,
  DashboardCompras as DC,
  DashboardAsesorRep as DAR,
  DashboardInformeMto as DIM,
} from "../types";

function DashboardViewFallback() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className={DASHBOARD_STYLES.spinner} />
      <p className="text-sm font-medium text-gray-600">{DASHBOARD_COPY.loading}</p>
    </div>
  );
}

// Un chunk por perfil: el home no debe bajar Gerencia+Taller+CC juntos.
const DashboardJefeTaller = dynamic(
  () => import("./DashboardJefeTaller").then((m) => m.DashboardJefeTaller),
  { loading: () => <DashboardViewFallback /> },
);
const DashboardTecnicos = dynamic(
  () => import("./DashboardTecnicos").then((m) => m.DashboardTecnicos),
  { loading: () => <DashboardViewFallback /> },
);
const DashboardAdmin = dynamic(
  () => import("./DashboardAdmin").then((m) => m.DashboardAdmin),
  { loading: () => <DashboardViewFallback /> },
);
const DashboardAgenteCC = dynamic(
  () => import("./DashboardAgenteCC").then((m) => m.DashboardAgenteCC),
  { loading: () => <DashboardViewFallback /> },
);
const DashboardGerencia = dynamic(
  () => import("./DashboardGerencia").then((m) => m.DashboardGerencia),
  { loading: () => <DashboardViewFallback /> },
);
const DashboardCompras = dynamic(
  () => import("./DashboardCompras").then((m) => m.DashboardCompras),
  { loading: () => <DashboardViewFallback /> },
);
const DashboardAsesorRep = dynamic(
  () => import("./DashboardAsesorRep").then((m) => m.DashboardAsesorRep),
  { loading: () => <DashboardViewFallback /> },
);
const DashboardInformeMto = dynamic(
  () => import("./DashboardInformeMto").then((m) => m.DashboardInformeMto),
  { loading: () => <DashboardViewFallback /> },
);

function DashboardShell({
  children,
  withMonthFilter = false,
  showMonthLoading = false,
  selectedMonth,
  onMonthChange,
}: {
  children: React.ReactNode;
  withMonthFilter?: boolean;
  showMonthLoading?: boolean;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3 sm:space-y-4 relative">
      {withMonthFilter && (
        <div className="flex flex-wrap items-center gap-3 justify-end">
          <div className="flex items-center gap-2">
            <label
              htmlFor="month-filter"
              className="text-sm text-gray-600 whitespace-nowrap"
            >
              {DASHBOARD_COPY.mesLabel}
            </label>
            <input
              id="month-filter"
              type="month"
              className={DASHBOARD_STYLES.monthInput}
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          </div>
        </div>
      )}
      {showMonthLoading && (
        <div className={DASHBOARD_STYLES.overlay}>
          <div className="flex flex-col items-center gap-3">
            <div className={DASHBOARD_STYLES.spinner} />
            <p className="text-sm text-gray-600 font-medium">
              {DASHBOARD_COPY.loadingMes}
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export function DashboardHomeGestion() {
  const { user } = useAuth();
  const allowed = isDashboardAllowedPerfil(user?.perfil_postventa);
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonthValue);
  const { mes, ano } = parseYearMonth(selectedMonth);

  const handleMonthChange = useCallback((value: string) => {
    setSelectedMonth(value);
  }, []);

  const empresaDashboard =
    typeof user?.empresa === "number" && Number.isFinite(user.empresa)
      ? user.empresa
      : undefined;

  const { data, isLoading, isFetching, error } = useDashboard(user?.id, {
    enabled: allowed,
    empresa: empresaDashboard,
    mes,
    ano,
  });

  const [settledEmpresa, setSettledEmpresa] = useState<
    number | undefined | "boot"
  >("boot");

  if (settledEmpresa === "boot") {
    setSettledEmpresa(empresaDashboard);
  } else if (!isFetching && settledEmpresa !== empresaDashboard) {
    setSettledEmpresa(empresaDashboard);
  }

  const empresaSwitchLoading =
    settledEmpresa !== "boot" &&
    settledEmpresa !== empresaDashboard &&
    isFetching;

  const wrap = (
    children: React.ReactNode,
    withMonthFilter = false,
    showMonthLoading = false,
  ) => (
    <DashboardShell
      withMonthFilter={withMonthFilter}
      showMonthLoading={showMonthLoading}
      selectedMonth={selectedMonth}
      onMonthChange={handleMonthChange}
    >
      {children}
    </DashboardShell>
  );

  if (!user) {
    return (
      <div className="p-2 sm:p-3 md:p-4 text-gray-500">
        {DASHBOARD_COPY.login}
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="p-2 sm:p-3 md:p-4">
        <DashboardEmpty />
      </div>
    );
  }

  if (error) {
    return wrap(<p className="text-red-600">{DASHBOARD_COPY.error}</p>);
  }

  const showMainDashboardLoading =
    isLoading || !data || (empresaSwitchLoading && isFetching);

  if (showMainDashboardLoading) {
    return wrap(
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className={DASHBOARD_STYLES.spinner} />
        <p className="text-sm text-gray-600 font-medium">
          {empresaSwitchLoading && isFetching
            ? DASHBOARD_COPY.loadingEmpresa
            : DASHBOARD_COPY.loading}
        </p>
      </div>,
    );
  }

  switch (data.variant) {
    case "jefe_taller":
      return wrap(<DashboardJefeTaller data={data as DJT} />);
    case "tecnicos":
      return wrap(<DashboardTecnicos data={data as DT} />, true, isFetching);
    case "admin":
      return wrap(<DashboardAdmin data={data as DA} />);
    case "agente_cc":
      return wrap(<DashboardAgenteCC data={data as DACC} />);
    case "gerencia":
      return wrap(<DashboardGerencia data={data as DG} />);
    case "compras":
      return wrap(<DashboardCompras data={data as DC} />);
    case "asesor_rep":
      return wrap(<DashboardAsesorRep data={data as DAR} />);
    case "informe_mto":
      return wrap(<DashboardInformeMto data={data as DIM} />);
    default:
      return wrap(<DashboardAdmin data={data as DA} />);
  }
}
