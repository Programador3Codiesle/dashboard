"use client";

import { memo, useMemo } from "react";
import { CircleDollarSign, Gauge, ShoppingCart } from "lucide-react";
import type { DashboardAsesorRep as DashboardAsesorRepType } from "../types";
import { formatCurrency } from "../utils/format-currency";
import { DashboardFechaBadge } from "./DashboardFechaBadge";
import { DashboardKpiCard } from "./DashboardKpiCard";
import { PageTitleRow } from "@/components/shared/layout/PageTitleRow";

const COLOR_VENDIDO = "var(--color-primary)";
const COLOR_PRESUPUESTO = "#64748b";

type EstadoCumplimiento = "malo" | "buena" | "bueno";

export interface SedeOption {
  idsede: number;
  idsede_v: string;
  descripcion: string;
}

interface DashboardAsesorRepProps {
  data: DashboardAsesorRepType;
  sedes?: SedeOption[];
  selectedIdsede?: number;
  onSedeChange?: (idsede: number) => void;
}

function DashboardAsesorRepInner({
  data,
  sedes,
  selectedIdsede,
  onSedeChange,
}: DashboardAsesorRepProps) {
  const presupuestos = useMemo(
    () => data.presupuestos_sede ?? [],
    [data.presupuestos_sede],
  );
  const resumen = useMemo(
    () => data.resumen_actual ?? [],
    [data.resumen_actual],
  );
  const showTabs = sedes != null && sedes.length > 1 && selectedIdsede != null && onSedeChange;

  const chartData = useMemo(() => {
    const presuMap = new Map(
      presupuestos.map((p) => [p.sede.trim().toLowerCase(), p.presupuesto])
    );
    const resumenMap = new Map<string, number>();
    resumen.forEach((r) => {
      const key = r.sede.trim().toLowerCase();
      const current = resumenMap.get(key) ?? 0;
      resumenMap.set(key, current + r.venta_neta);
    });
    const sedesSet = new Set([...presuMap.keys(), ...resumenMap.keys()]);
    const rows: Array<{
      sede: string;
      vendido: number;
      presupuesto: number;
      porcentaje: number;
      estado: EstadoCumplimiento;
    }> = [];
    sedesSet.forEach((key) => {
      const presu = presupuestos.find(
        (p) => p.sede.trim().toLowerCase() === key
      );
      const res = resumen.find((r) => r.sede.trim().toLowerCase() === key);
      const sedeLabel = presu?.sede ?? res?.sede ?? key;
      const vendido = resumenMap.get(key) ?? 0;
      const presupuesto = presuMap.get(key) ?? 0;
      const porcentaje = presupuesto > 0 ? (vendido / presupuesto) * 100 : 0;
      let estado: EstadoCumplimiento = "malo";
      if (porcentaje >= 90) estado = "bueno";
      else if (porcentaje >= 80) estado = "buena";
      rows.push({
        sede: sedeLabel,
        vendido,
        presupuesto,
        porcentaje,
        estado,
      });
    });
    if (rows.length === 0) return { rows: [], maxVal: 1 };
    const maxVal = Math.max(
      ...rows.flatMap((r) => [r.vendido, r.presupuesto]),
      1
    );
    return { rows, maxVal };
  }, [resumen, presupuestos]);

  const { porcentajeGlobal, estadoGlobal } = useMemo(() => {
    if (chartData.rows.length === 0) {
      return { porcentajeGlobal: 0, estadoGlobal: "malo" as EstadoCumplimiento };
    }
    const totalVendido = chartData.rows.reduce((s, r) => s + r.vendido, 0);
    const totalPresupuesto = chartData.rows.reduce((s, r) => s + r.presupuesto, 0);
    const porcentaje = totalPresupuesto > 0 ? (totalVendido / totalPresupuesto) * 100 : 0;
    let estado: EstadoCumplimiento = "malo";
    if (porcentaje >= 90) estado = "bueno";
    else if (porcentaje >= 80) estado = "buena";
    return { porcentajeGlobal: porcentaje, estadoGlobal: estado };
  }, [chartData.rows]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Tabs por sede cuando el usuario tiene más de una */}
      {showTabs && (
        <nav
          className="flex flex-wrap gap-1 rounded-xl border border-gray-200/80 bg-white p-1 shadow-sm"
          aria-label="Sedes"
        >
          {sedes!.map((sede) => {
            const isActive = sede.idsede === selectedIdsede;
            return (
              <button
                key={sede.idsede}
                type="button"
                onClick={() => onSedeChange!(sede.idsede)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                style={isActive ? { backgroundColor: "var(--color-primary)" } : undefined}
              >
                {sede.descripcion}
              </button>
            );
          })}
        </nav>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitleRow
          title="Asesor de repuestos"
          description="Resumen de desempeño, cumplimiento de presupuesto y ventas por sede."
          headingAs="h2"
          headingClassName="text-2xl font-bold text-gray-900 tracking-tight"
          descriptionClassName="text-sm text-gray-500 mt-1"
          className="min-w-0"
        />
        <DashboardFechaBadge
          fecha={data.fecha_actual}
          diaFestivo={data.dia_festivo}
        />
      </div>

      {/* Presupuesto, Resumen y Estado/% en columnas */}
      <div className=" grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Columna 1: Presupuesto por sede */}
        <section className="py-1 rounded-xl flex flex-col h-full ">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Presupuesto por sede
          </h3>
          {presupuestos.length > 0 ? (
            <div className="flex-1 space-y-3">
              {presupuestos.map((p, i) => (
                <DashboardKpiCard
                  key={i}
                  label={p.sede}
                  value={formatCurrency(p.presupuesto)}
                  icon={CircleDollarSign}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-sm w-full text-center">
                Sin presupuestos asignados.
              </p>
            </div>
          )}
        </section>

        {/* Columna 2: Resumen por sede */}
        {resumen.length > 0 ? (
          <section className="flex flex-col h-full ">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Resumen por sede
            </h3>
            <div className="flex-1 space-y-3">
              {resumen.map((row, idx) => (
                <DashboardKpiCard
                  key={`${row.sede}-${idx}`}
                  label={row.sede_label2 ? `${row.sede} · ${row.sede_label2}` : row.sede}
                  value={formatCurrency(row.venta_neta)}
                  icon={ShoppingCart}
                  footer={
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Margen</span>
                        <span className="font-medium tabular-nums text-gray-700">
                          {row.margen_bruto.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comisión</span>
                        <span className="font-medium tabular-nums text-gray-700">
                          {formatCurrency(row.total_comision)}
                        </span>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="flex flex-col h-full ">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Resumen por sede
            </h3>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-sm w-full text-center">
                Sin resumen disponible.
              </p>
            </div>
          </section>
        )}

        {/* Columna 3: Estado y % cumplimiento */}
        <section className="flex flex-col h-full ">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Estado y cumplimiento
          </h3>
          <DashboardKpiCard
            label="% cumplimiento"
            value={`${porcentajeGlobal.toFixed(1)}%`}
            icon={Gauge}
            footer={
              <span
                className={`inline-flex text-sm font-semibold px-3 py-1.5 rounded ${
                  estadoGlobal === "bueno"
                    ? "bg-emerald-100 text-emerald-800"
                    : estadoGlobal === "buena"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {estadoGlobal === "bueno"
                  ? "Bueno"
                  : estadoGlobal === "buena"
                    ? "Buena"
                    : "Malo"}
              </span>
            }
          />
        </section>
      </div>

      {/* Gráfica centrada - Movida abajo */}
      {chartData.rows.length > 0 && (
        <section className="max-w-4xl mx-auto rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Total vendido vs presupuesto por sede
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              X: Sede · Y: Pesos ($). % = vendido/presupuesto. &lt;80% Malo,
              80-90% Buena, ≥90% Bueno.
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-600">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: COLOR_VENDIDO }}
                />
                Vendido
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-600">
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{ backgroundColor: COLOR_PRESUPUESTO }}
                />
                Presupuesto
              </span>
              <span className="text-xs text-gray-500">·</span>
              <span className="inline-flex items-center gap-1.5 text-xs">
                <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-medium">
                  Malo
                </span>
                <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                  Buena
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                  Bueno
                </span>
              </span>
            </div>
          </div>

          {/* Tabla resumen compacta */}
          <div className="app-table-scroll">
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700">
                    Sede
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">
                    Presupuesto
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">
                    Vendido (resumen por sede)
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700">
                    %
                  </th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {chartData.rows.map((row) => (
                  <tr
                    key={row.sede}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="py-2 px-3 text-gray-900 font-medium truncate max-w-[200px]">
                      {row.sede}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-gray-700">
                      {formatCurrency(row.presupuesto)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-gray-700">
                      {formatCurrency(row.vendido)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-medium">
                      {row.porcentaje.toFixed(1)}%
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          row.estado === "bueno"
                            ? "bg-emerald-100 text-emerald-800"
                            : row.estado === "buena"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.estado === "bueno"
                          ? "Bueno"
                          : row.estado === "buena"
                          ? "Buena"
                          : "Malo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Barras: centradas y sin tanto espacio lateral */}
          <div className="flex gap-4 min-h-[200px]">
            <div className="flex flex-col justify-between py-2 pr-3 border-r border-gray-200 shrink-0 w-16">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Y: Pesos ($)
              </span>
              <div className="flex flex-col justify-between h-36 sm:h-40 text-right">
                {[1, 0.75, 0.5, 0.25, 0].map((pct) => (
                  <span
                    key={pct}
                    className="text-xs text-gray-400 tabular-nums"
                    aria-hidden
                  >
                    {pct === 0
                      ? "0"
                      : new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 0,
                          notation: "compact",
                        }).format(chartData.maxVal * pct)}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex flex-1 items-end gap-2 min-h-[160px] overflow-x-auto justify-center">
                {chartData.rows.map((row) => (
                  <div
                    key={row.sede}
                    className="flex flex-col items-center gap-1 min-w-[64px] sm:min-w-[80px] shrink-0"
                  >
                    <div className="w-full flex justify-center gap-1 items-end h-36 sm:h-40">
                      <div
                        className="flex flex-col justify-end flex-1 max-w-[28px] sm:max-w-[36px] h-full rounded-t-md overflow-hidden bg-gray-100/80"
                        title={`Vendido: $${formatCurrency(row.vendido)}`}
                      >
                        <div
                          className="w-full rounded-t-md transition-all duration-500 ease-out min-h-[2px]"
                          style={{
                            height: `${Math.max(
                              2,
                              (row.vendido / chartData.maxVal) * 100
                            )}%`,
                            backgroundColor: COLOR_VENDIDO,
                          }}
                        />
                      </div>
                      <div
                        className="flex flex-col justify-end flex-1 max-w-[28px] sm:max-w-[36px] h-full rounded-t-md overflow-hidden bg-gray-100/80"
                        title={`Presupuesto: $${formatCurrency(row.presupuesto)}`}
                      >
                        <div
                          className="w-full rounded-t-md transition-all duration-500 ease-out min-h-[2px]"
                          style={{
                            height: `${Math.max(
                              2,
                              (row.presupuesto / chartData.maxVal) * 100
                            )}%`,
                            backgroundColor: COLOR_PRESUPUESTO,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center truncate max-w-full">
                      {row.sede}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-gray-800">
                      {row.porcentaje.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center border-t border-gray-100 pt-2">
                X: Sede
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export const DashboardAsesorRep = memo(DashboardAsesorRepInner);
