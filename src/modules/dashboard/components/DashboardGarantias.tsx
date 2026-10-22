"use client";

import { memo, useState, type ReactNode } from "react";
import type { DashboardGarantias as DashboardGarantiasType, GarantiasBodega, GarantiasMes } from "../types";
import { formatCurrency } from "../utils/format-currency";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { DashboardFechaBadge } from "./DashboardFechaBadge";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";
import { DASHBOARD_COPY } from "../constants";

const SERIE_MO = "bg-amber-500";
const SERIE_REP = "bg-cyan-400";
const SERIE_TOT = "bg-purple-400";

function porcentaje(parte: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((parte / total) * 1000) / 10;
}

function ChartCard({
  title,
  children,
  legend,
}: {
  title: string;
  children: ReactNode;
  legend?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {legend}
      </div>
      {children}
    </div>
  );
}

function SerieLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-3 w-3 shrink-0 rounded-sm ${SERIE_MO}`} aria-hidden />
        M.O
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-3 w-3 shrink-0 rounded-sm ${SERIE_REP}`} aria-hidden />
        Repuestos
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`h-3 w-3 shrink-0 rounded-sm ${SERIE_TOT}`} aria-hidden />
        TOT
      </span>
    </div>
  );
}

const ChartVendido = memo(function ChartVendido({ meses }: { meses: GarantiasMes[] }) {
  const maxTotal = Math.max(...meses.map((mes) => mes.total), 1);
  return (
    <ChartCard title="Total vendido" legend={<SerieLegend />}>
      <div className="space-y-2">
        {meses.map((mes) => {
          const ancho = mes.total > 0 ? (mes.total / maxTotal) * 100 : 0;
          return (
            <div key={mes.mes} className="flex items-center gap-2">
              <span className="w-16 truncate text-xs text-gray-600">{mes.mesNom}</span>
              <div className="h-6 min-w-0 flex-1 overflow-hidden rounded bg-gray-100">
                <div className="flex h-full" style={{ width: `${ancho}%` }}>
                  {mes.mo > 0 && (
                    <div
                      className={`h-full ${SERIE_MO}`}
                      style={{ width: `${(mes.mo / mes.total) * 100}%` }}
                      title={`M.O: ${formatCurrency(mes.mo)}`}
                    />
                  )}
                  {mes.repuestos > 0 && (
                    <div
                      className={`h-full ${SERIE_REP}`}
                      style={{ width: `${(mes.repuestos / mes.total) * 100}%` }}
                      title={`Repuestos: ${formatCurrency(mes.repuestos)}`}
                    />
                  )}
                  {mes.tot > 0 && (
                    <div
                      className={`h-full ${SERIE_TOT}`}
                      style={{ width: `${(mes.tot / mes.total) * 100}%` }}
                      title={`TOT: ${formatCurrency(mes.tot)}`}
                    />
                  )}
                </div>
              </div>
              <span className="w-20 text-right text-xs text-gray-500">
                {formatCurrency(mes.total)}
              </span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
});

const ChartHoras = memo(function ChartHoras({ meses }: { meses: GarantiasMes[] }) {
  const maxHoras = Math.max(...meses.map((mes) => mes.horas), 1);
  return (
    <ChartCard title="Horas facturadas">
      <div className="space-y-2">
        {meses.map((mes) => (
          <div key={mes.mes} className="flex items-center gap-2">
            <span className="w-16 truncate text-xs text-gray-600">{mes.mesNom}</span>
            <div className="h-6 min-w-0 flex-1 overflow-hidden rounded bg-gray-100">
              <div
                className="h-full rounded brand-bg"
                style={{ width: `${(mes.horas / maxHoras) * 100}%` }}
              />
            </div>
            <span className="w-16 text-right text-xs text-gray-500">
              {formatCurrency(mes.horas)}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
});

const ChartComposicion = memo(function ChartComposicion({
  bodega,
}: {
  bodega: GarantiasBodega;
}) {
  const partes = [
    { key: "mo", label: "M.O", valor: bodega.mo, color: SERIE_MO },
    { key: "tot", label: "TOT", valor: bodega.tot, color: SERIE_TOT },
    { key: "rep", label: "Repuestos", valor: bodega.repuestos, color: SERIE_REP },
  ];
  return (
    <ChartCard title="Composición del mes">
      <div className="space-y-3">
        {partes.map((parte) => {
          const pct = porcentaje(parte.valor, bodega.total);
          return (
            <div key={parte.key} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{parte.label}</span>
                <span>
                  {pct.toFixed(1)}% · {formatCurrency(parte.valor)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${parte.color}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
});

const ChartComparacion = memo(function ChartComparacion({
  bodegas,
  activa,
  onSelect,
}: {
  bodegas: GarantiasBodega[];
  activa: number;
  onSelect: (index: number) => void;
}) {
  const maxTotal = Math.max(...bodegas.map((bodega) => bodega.total), 1);
  return (
    <ChartCard title="Garantías del mes por bodega">
      <div className="space-y-2">
        {bodegas.map((bodega, index) => {
          const esActiva = index === activa;
          return (
            <button
              key={bodega.idsede}
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={esActiva}
              className="flex w-full items-center gap-2 rounded-md text-left brand-focus-ring"
            >
              <span className="w-24 truncate text-xs text-gray-600">{bodega.sede}</span>
              <span className="h-6 min-w-0 flex-1 overflow-hidden rounded bg-gray-100">
                <span
                  className={`block h-full rounded ${esActiva ? "brand-bg" : "bg-gray-300"}`}
                  style={{ width: `${(bodega.total / maxTotal) * 100}%` }}
                />
              </span>
              <span className="w-20 text-right text-xs text-gray-500">
                {formatCurrency(bodega.total)}
              </span>
            </button>
          );
        })}
      </div>
    </ChartCard>
  );
});

function BodegaPanel({
  bodega,
  bodegas,
  activa,
  onSelect,
}: {
  bodega: GarantiasBodega;
  bodegas: GarantiasBodega[];
  activa: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="space-y-6 pt-2">
      <div className="app-kpi-grid">
        <DashboardKpiCard label="Total vendido" value={`$${formatCurrency(bodega.total)}`} />
        <DashboardKpiCard label="M.O" value={`$${formatCurrency(bodega.mo)}`} />
        <DashboardKpiCard label="TOT" value={`$${formatCurrency(bodega.tot)}`} />
        <DashboardKpiCard label="Repuestos" value={`$${formatCurrency(bodega.repuestos)}`} />
        <DashboardKpiCard label="Horas facturadas" value={formatCurrency(bodega.horas)} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartVendido meses={bodega.meses} />
        <ChartHoras meses={bodega.meses} />
        <ChartComposicion bodega={bodega} />
        <ChartComparacion bodegas={bodegas} activa={activa} onSelect={onSelect} />
      </div>
    </div>
  );
}

function DashboardGarantiasInner({
  data,
  selectedMonth,
  onMonthChange,
}: {
  data: DashboardGarantiasType;
  selectedMonth: string;
  onMonthChange: (value: string) => void;
}) {
  const bodegas = data.bodegas;
  const bodegaKey = bodegas.map((bodega) => bodega.idsede).join(",");
  const [tab, setTab] = useState({ key: bodegaKey, index: 0 });
  if (tab.key !== bodegaKey) {
    setTab({ key: bodegaKey, index: 0 });
  }
  const activa = tab.key === bodegaKey ? tab.index : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitleRow
          title="Informe de garantías"
          description="Venta de garantía de tus bodegas."
          headingAs="h2"
          headingClassName="text-xl font-bold text-gray-900"
          descriptionClassName="text-sm text-gray-500"
          className="min-w-0"
        />
        <DashboardFechaBadge
          fecha={data.fecha_actual}
          diaFestivo={data.dia_festivo}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
        />
      </div>

      {bodegas.length === 0 ? (
        <p className="text-sm text-gray-600">{DASHBOARD_COPY.garantiasSinBodegas}</p>
      ) : (
        <>
          <nav
            className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-3"
            role="tablist"
            aria-label="Bodegas de garantías"
          >
            {bodegas.map((bodega, index) => {
              const esActiva = activa === index;
              return (
                <button
                  key={bodega.idsede}
                  type="button"
                  role="tab"
                  aria-selected={esActiva}
                  onClick={() => setTab({ key: bodegaKey, index })}
                  className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 brand-focus-ring sm:px-5 sm:py-2.5 sm:text-sm ${
                    esActiva
                      ? "brand-btn brand-card-elevated shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                      : "border bg-white text-gray-800 shadow-md brand-border-active hover:-translate-y-0.5 hover:text-[var(--color-primary)] hover:shadow-lg active:scale-[0.98]"
                  }`}
                >
                  {bodega.sede}
                </button>
              );
            })}
          </nav>
          {bodegas[activa] ? (
            <BodegaPanel
              bodega={bodegas[activa]}
              bodegas={bodegas}
              activa={activa}
              onSelect={(index) => setTab({ key: bodegaKey, index })}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

export const DashboardGarantias = memo(DashboardGarantiasInner);
