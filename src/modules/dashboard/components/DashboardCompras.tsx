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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardKpiCard
            label="Solicitudes pendientes"
            value={data.solicitudes_pendientes}
          />
          <DashboardKpiCard
            label="Solicitudes en proceso"
            value={data.solicitudes_proceso}
          />
          <DashboardKpiCard
            label="Solicitudes finalizadas"
            value={data.solicitudes_finalizadas}
          />
        </div>
      </div>
    </div>
  );
}

export const DashboardCompras = memo(DashboardComprasInner);
