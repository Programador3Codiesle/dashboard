"use client";

import { memo } from "react";
import type { DashboardInformeMto as DashboardInformeMtoType } from "../types";
import { DashboardFechaBadge } from "./DashboardFechaBadge";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";

function DashboardInformeMtoInner({ data }: { data: DashboardInformeMtoType }) {
  return (
    <div className="space-y-6">
      <PageTitleRow
        title="Informe solicitud de mantenimiento"
        headingAs="h2"
        headingClassName="text-xl font-bold text-gray-900"
      />
      <DashboardFechaBadge
        fecha={data.fecha_actual}
        diaFestivo={data.dia_festivo}
      />
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mantenimiento correctivo
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardKpiCard label="Pendientes" value={data.pendientes} />
            <DashboardKpiCard label="En proceso" value={data.proceso} />
            <DashboardKpiCard label="Finalizadas" value={data.finalizadas} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mantenimiento preventivo (hoy)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DashboardKpiCard label="Pendientes" value={data.pendientesPre} />
            <DashboardKpiCard label="En proceso" value={data.procesoPre} />
            <DashboardKpiCard label="Finalizadas" value={data.finalizadasPre} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const DashboardInformeMto = memo(DashboardInformeMtoInner);
