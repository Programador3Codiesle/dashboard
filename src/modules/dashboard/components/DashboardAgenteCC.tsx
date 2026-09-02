"use client";

import { memo } from "react";
import { Headset } from "lucide-react";
import type { DashboardAgenteCC as DashboardAgenteCCType } from "../types";
import { DashboardFechaBadge } from "./DashboardFechaBadge";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";

function DashboardAgenteCCInner({ data }: { data: DashboardAgenteCCType }) {
  const estadoActual =
    data.data_estado?.length && data.data_estado[0].estado
      ? data.data_estado[0].estado
      : "Inactivo";
  const isActivo = estadoActual === "Activo";

  return (
    <div className="space-y-6">
      <PageTitleRow
        title="Agente Call Center"
        headingAs="h2"
        headingClassName="text-xl font-bold text-gray-900"
      />
      <DashboardFechaBadge
        fecha={data.fecha_actual}
        diaFestivo={data.dia_festivo}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <DashboardKpiCard
          label="Estado actual"
          value={
            <span className={isActivo ? "text-emerald-700" : "text-gray-500"}>
              {estadoActual}
            </span>
          }
          icon={Headset}
          footer="El cambio de estado se realiza desde el módulo correspondiente"
        />
      </div>
    </div>
  );
}

export const DashboardAgenteCC = memo(DashboardAgenteCCInner);
