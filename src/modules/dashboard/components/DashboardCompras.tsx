"use client";

import { memo } from "react";
import type { DashboardCompras as DashboardComprasType } from "../types";
import { DashboardFechaBadge } from "./DashboardFechaBadge";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";

function DashboardComprasInner({ data }: { data: DashboardComprasType }) {
  return (
    <div className="space-y-6">
      <PageTitleRow
        title="Compras"
        headingAs="h2"
        headingClassName="text-xl font-bold text-gray-900"
      />
      <DashboardFechaBadge
        fecha={data.fecha_actual}
        diaFestivo={data.dia_festivo}
      />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen solicitudes
        </h3>
        <div className="app-kpi-grid-3">
          <DashboardKpiCard
            label="Solicitudes pendientes"
            value={data.solicitudes_pendientes ?? 0}
          />
          <DashboardKpiCard
            label="Solicitudes en proceso"
            value={data.solicitudes_proceso ?? 0}
          />
          <DashboardKpiCard
            label="Solicitudes finalizadas"
            value={data.solicitudes_finalizadas ?? 0}
          />
        </div>
      </div>
    </div>
  );
}

export const DashboardCompras = memo(DashboardComprasInner);
