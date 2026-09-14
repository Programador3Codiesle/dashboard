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
          <div className="app-kpi-grid-3">
            <DashboardKpiCard label="Pendientes" value={data.pendientes ?? 0} />
            <DashboardKpiCard label="En proceso" value={data.proceso ?? 0} />
            <DashboardKpiCard label="Finalizadas" value={data.finalizadas ?? 0} />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Mantenimiento preventivo (hoy)
          </h3>
          <div className="app-kpi-grid-3">
            <DashboardKpiCard
              label="Pendientes"
              value={data.pendientesPre ?? 0}
            />
            <DashboardKpiCard
              label="En proceso"
              value={data.procesoPre ?? 0}
            />
            <DashboardKpiCard
              label="Finalizadas"
              value={data.finalizadasPre ?? 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const DashboardInformeMto = memo(DashboardInformeMtoInner);
