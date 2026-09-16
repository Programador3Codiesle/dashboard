"use client";

import { memo } from "react";
import { CircleDollarSign, Percent, Store, Wallet } from "lucide-react";
import type { DashboardAsesorRep as DashboardAsesorRepType } from "../types";
import { formatCurrency } from "../utils/format-currency";
import { DashboardFechaBadge } from "./DashboardFechaBadge";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";

interface DashboardAsesorRepProps {
  data: DashboardAsesorRepType;
}

function DashboardAsesorRepInner({ data }: DashboardAsesorRepProps) {
  const resumen = data.resumen_actual ?? [];
  const totalVendido = data.total_vendido_global ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitleRow
          title="Asesor de repuestos"
          description="Venta neta, margen y comisión del mes actual."
          headingAs="h2"
          headingClassName="text-2xl font-bold tracking-tight text-gray-900"
          descriptionClassName="mt-1 text-sm text-gray-500"
          className="min-w-0"
        />
        <DashboardFechaBadge
          fecha={data.fecha_actual}
          diaFestivo={data.dia_festivo}
        />
      </div>

      {resumen.length > 0 ? (
        <div className="space-y-6">
          {resumen.map((row, idx) => {
            const sede = row.sede_label2 || row.sede;
            return (
              <div
                key={`${sede}-${idx}`}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              >
                <DashboardKpiCard
                  label={`Total vendido ${sede}`}
                  value={formatCurrency(row.venta_neta)}
                  icon={CircleDollarSign}
                />
                <DashboardKpiCard
                  label="Margen"
                  value={`${Number(row.margen_bruto).toFixed(2)}%`}
                  icon={Percent}
                />
                <DashboardKpiCard
                  label="Comisión"
                  value={formatCurrency(row.total_comision)}
                  icon={Wallet}
                />
                <DashboardKpiCard
                  label="Total vendido"
                  value={formatCurrency(totalVendido)}
                  icon={Store}
                />
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export const DashboardAsesorRep = memo(DashboardAsesorRepInner);
