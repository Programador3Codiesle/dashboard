"use client";

import { memo, useCallback, useState } from "react";
import type {
  DashboardJefeTaller as DashboardJefeTallerType,
  DataPoint,
  JefeTallerSedeItem,
} from "../types";
import { formatCurrency } from "../utils/format-currency";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { DashboardFechaBadge } from "./DashboardFechaBadge";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";

function maxY(points: DataPoint[]): number {
  if (points.length === 0) return 1;
  const m = Math.max(...points.map((p) => p.y));
  return m > 0 ? m : 1;
}

const ChartBarSimple = memo(function ChartBarSimple({
  title,
  dataPoints,
  metaPoints,
  formatValue = (v: number) => String(v),
  metaLabel = "Meta",
}: {
  title: string;
  dataPoints: DataPoint[];
  metaPoints?: DataPoint[];
  formatValue?: (v: number) => string;
  metaLabel?: string;
}) {
  const maxVal = Math.max(maxY(dataPoints), ...(metaPoints?.map((p) => p.y) ?? [0]));
  const metaVal = metaPoints?.[0]?.y;
  return (
    <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      <div className="space-y-2">
        {dataPoints.map((dp, i) => {
          const cumpleMeta = metaVal != null && dp.y >= metaVal;
          const tieneMeta = metaVal != null;
          const barColor = tieneMeta
            ? cumpleMeta
              ? "bg-emerald-500"
              : "bg-red-400"
            : "brand-bg";
          const textColor = tieneMeta
            ? cumpleMeta
              ? "text-emerald-600 font-medium"
              : "text-red-600"
            : "text-gray-500";
          return (
            <div key={`${dp.label}-${i}`} className="flex items-center gap-2">
              <span className="w-16 text-xs text-gray-600 truncate">
                {dp.label}
              </span>
              <div className="flex-1 flex items-center gap-1">
                <div
                  className={`h-6 rounded min-w-[2px] transition-all ${barColor}`}
                  style={{
                    width: `${Math.min(100, (dp.y / maxVal) * 100)}%`,
                  }}
                  title={formatValue(dp.y)}
                />
                <span className={`text-xs w-16 text-right ${textColor}`} title={tieneMeta ? (cumpleMeta ? "Cumple meta" : "No cumple meta") : undefined}>
                  {formatValue(dp.y)}
                  {tieneMeta && (
                    <span className="ml-0.5" aria-hidden>
                      {cumpleMeta ? "✓" : "✗"}
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
        {metaVal != null && (
          <p className="text-xs text-red-600 pt-1 border-t border-gray-100">
            {metaLabel}: {formatValue(metaVal)}
          </p>
        )}
      </div>
    </div>
  );
});

const ChartTotalVendido = memo(function ChartTotalVendido({
  dataPoints1,
  dataPoints2,
  dataPoints3,
  dataPoints4,
}: {
  dataPoints1: DataPoint[];
  dataPoints2: DataPoint[];
  dataPoints3: DataPoint[];
  dataPoints4: DataPoint[];
}) {
  const maxVal = maxY(dataPoints4);
  return (
    <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Gráfica Total Vendido
        </h4>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" aria-hidden />
            M.O
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-cyan-400 shrink-0" aria-hidden />
            Rptos
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-purple-400 shrink-0" aria-hidden />
            TOT
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {dataPoints4.map((dp, i) => {
          const mo = dataPoints1[i]?.y ?? 0;
          const rptos = dataPoints2[i]?.y ?? 0;
          const tot = dataPoints3[i]?.y ?? 0;
          return (
            <div key={`${dp.label}-${i}`} className="flex items-center gap-2">
              <span className="w-16 text-xs text-gray-600 truncate">
                {dp.label}
              </span>
              <div className="flex-1 flex items-center gap-0.5">
                {mo > 0 && (
                  <div
                    className="h-6 bg-amber-500 rounded-l min-w-[2px]"
                    style={{
                      width: `${(mo / maxVal) * 50}%`,
                    }}
                    title={`M.O: ${formatCurrency(mo)}`}
                  />
                )}
                {rptos > 0 && (
                  <div
                    className="h-6 bg-cyan-400 min-w-[2px]"
                    style={{
                      width: `${(rptos / maxVal) * 50}%`,
                    }}
                    title={`Rptos: ${formatCurrency(rptos)}`}
                  />
                )}
                {tot > 0 && (
                  <div
                    className="h-6 bg-purple-400 rounded-r min-w-[2px]"
                    style={{
                      width: `${(tot / maxVal) * 50}%`,
                    }}
                    title={`TOT: ${formatCurrency(tot)}`}
                  />
                )}
                <span className="text-xs text-gray-500 w-20 text-right ml-1">
                  {formatCurrency(dp.y)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const SedeCards = memo(function SedeCards({ sede }: { sede: JefeTallerSedeItem }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardKpiCard
        label="Total Vendido"
        value={`$${formatCurrency(sede.totalVenta)}`}
      />
      <DashboardKpiCard
        label="Total M.O"
        value={`$${formatCurrency(sede.totalVentaManoObra)}`}
      />
      <DashboardKpiCard
        label="Total TOT"
        value={`$${formatCurrency(sede.totalVentaTot)}`}
      />
      <DashboardKpiCard
        label="Total Rptos"
        value={`$${formatCurrency(sede.totalVentaRepuesto)}`}
      />
      <DashboardKpiCard
        label="Horas Facturadas"
        value={formatCurrency(sede.totalHoras)}
      />
      <DashboardKpiCard
        label="NPS Interno"
        value={`${Math.round(sede.objectiveNpsIntCurrent)}%`}
      />
      <DashboardKpiCard
        label="NPS COLMOTORES"
        value={`${Math.round(sede.objectiveNpsGMIntCurrent)}%`}
      />
    </div>
  );
});

const SedeCharts = memo(function SedeCharts({ sede }: { sede: JefeTallerSedeItem }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartTotalVendido
        dataPoints1={sede.dataPoints1}
        dataPoints2={sede.dataPoints2}
        dataPoints3={sede.dataPoints3}
        dataPoints4={sede.dataPoints4}
      />
      <ChartBarSimple
        title="Horas Facturadas"
        dataPoints={sede.dataPoints5}
        formatValue={(v) => formatCurrency(v)}
      />
      <ChartBarSimple
        title="NPS Interno"
        dataPoints={sede.dataPoints6}
        metaPoints={sede.objetiveNps}
        metaLabel="Meta"
        formatValue={(v) => Number(v).toFixed(1)}
      />
      <ChartBarSimple
        title="NPS GM"
        dataPoints={sede.dataPoints7}
        metaPoints={sede.objetiveNpsGM}
        metaLabel="Meta"
        formatValue={(v) => Number(v).toFixed(1)}
      />
    </div>
  );
});

function SedePanel({
  sede,
  isActive,
}: {
  sede: JefeTallerSedeItem;
  isActive: boolean;
}) {
  if (!isActive) return null;
  return (
    <div className="space-y-6 pt-2">
      <SedeCards sede={sede} />
      <SedeCharts sede={sede} />
    </div>
  );
}

function DashboardJefeTallerInner({ data }: { data: DashboardJefeTallerType }) {
  const [activeTab, setActiveTab] = useState(0);
  const hasSedes = data.sedes && data.sedes.length > 0;

  const onTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  if (hasSedes) {
    const sedes = data.sedes!;
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageTitleRow
            title="Informe diario Taller por sede"
            headingAs="h2"
            headingClassName="text-xl font-bold text-gray-900"
            className="min-w-0"
          />
          <DashboardFechaBadge
            fecha={data.fecha_actual}
            diaFestivo={data.dia_festivo}
          />
        </div>
        <nav
          className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3"
          role="tablist"
          aria-label="Sedes del informe diario"
        >
          {sedes.map((sede, index) => {
            const isActive = activeTab === index;
            return (
              <button
                key={sede.sede}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(index)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 brand-focus-ring sm:px-5 sm:py-2.5 sm:text-sm ${
                  isActive
                    ? "brand-btn brand-card-elevated shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                    : "bg-white text-gray-800 shadow-md border brand-border-active hover:-translate-y-0.5 hover:shadow-lg hover:text-[var(--color-primary)] active:scale-[0.98]"
                }`}
              >
                {sede.sede}
              </button>
            );
          })}
        </nav>
        {sedes.map((sede, index) => (
          <SedePanel
            key={sede.sede}
            sede={sede}
            isActive={activeTab === index}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitleRow
          title="Informe diario Taller"
          headingAs="h2"
          headingClassName="text-xl font-bold text-gray-900"
          className="min-w-0"
        />
        <DashboardFechaBadge
          fecha={data.fecha_actual}
          diaFestivo={data.dia_festivo}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardKpiCard
          label="Total Vendido"
          value={`$${formatCurrency(data.total_ventas)}`}
        />
        <DashboardKpiCard label="Total M.O" value={`$${formatCurrency(data.mo)}`} />
        <DashboardKpiCard label="Total TOT" value={`$${formatCurrency(data.tot)}`} />
        <DashboardKpiCard
          label="Total Rptos"
          value={`$${formatCurrency(data.rep)}`}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DashboardKpiCard label="Horas Facturadas" value={data.horas_fac} />
        <DashboardKpiCard
          label="NPS Interno"
          value={`${Math.round(data.nps_int)}%`}
        />
      </div>
      <DashboardKpiCard
        label="NPS Colmotores"
        value={`${Math.round(data.nps_col)}%`}
      />
    </div>
  );
}

export const DashboardJefeTaller = memo(DashboardJefeTallerInner);
