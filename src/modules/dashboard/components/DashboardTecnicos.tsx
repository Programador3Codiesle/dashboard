"use client";

import { memo, useMemo } from "react";
import type { DashboardTecnicos as DashboardTecnicosType } from "../types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function DashboardTecnicosInner({ data }: { data: DashboardTecnicosType }) {
  const ventasSeries = data.ventas_mensuales ?? [];
  const horasSeries = data.horas_mensuales ?? [];
  const npsIntSeries = data.nps_interno_mensual ?? [];
  const npsGmSeries = data.nps_gm_mensual ?? [];

  const maxVentaTotal = useMemo(
    () =>
      ventasSeries.reduce(
        (max, v) => (v.total > max ? v.total : max),
        0
      ) || 1,
    [ventasSeries]
  );

  const maxHoras = useMemo(
    () =>
      horasSeries.reduce(
        (max, v) => (v.horas > max ? v.horas : max),
        0
      ) || 1,
    [horasSeries]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-gray-900">Dashboard Técnicos</h2>
        <p className="text-sm text-gray-500">
          Resumen diario e histórico de desempeño del técnico.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Vendido</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.total_ventas)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">M.O</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.mo)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Repuestos</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.rep)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Horas Facturadas</p>
          <p className="text-2xl font-bold text-gray-900">{data.horas_fac}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">NPS Interno</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(data.nps_int)}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">NPS Colmotores</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(data.nps_col)}%
          </p>
        </div>
      </div>
      {(ventasSeries.length > 0 || horasSeries.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ventasSeries.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Ventas mensuales (MO + Repuestos)
              </h3>
              <div className="space-y-2">
                {ventasSeries.map((v) => {
                  const width = Math.round((v.total / maxVentaTotal) * 100);
                  return (
                    <div key={v.mes} className="space-y-1">
                      <div className="flex items-baseline justify-between text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                          {v.mes}
                        </span>
                        <span className="font-semibold text-gray-700">
                          ${formatCurrency(v.total)}
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-sky-500 via-blue-500 to-indigo-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>MO: ${formatCurrency(v.mo)}</span>
                        <span>Repuestos: ${formatCurrency(v.repuestos)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {horasSeries.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Horas facturadas mensuales
              </h3>
              <div className="space-y-2">
                {horasSeries.map((h) => {
                  const width = Math.round((h.horas / maxHoras) * 100);
                  return (
                    <div key={h.mes} className="space-y-1">
                      <div className="flex items-baseline justify-between text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                          {h.mes}
                        </span>
                        <span className="font-semibold text-gray-700">
                          {h.horas.toFixed(1)} h
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-indigo-500 to-sky-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {(npsIntSeries.length > 0 || npsGmSeries.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {npsIntSeries.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                NPS Interno mensual
              </h3>
              <div className="space-y-2">
                {npsIntSeries.map((n) => (
                  <div key={n.mes} className="space-y-1">
                    <div className="flex items-baseline justify-between text-xs text-gray-500">
                      <span className="font-medium text-gray-700">
                        {n.mes}
                      </span>
                      <span className="font-semibold text-gray-700">
                        {n.nps.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.max(0, Math.min(100, n.nps))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {npsGmSeries.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow border border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                NPS GM mensual
              </h3>
              <div className="space-y-2">
                {npsGmSeries.map((n) => (
                  <div key={n.mes} className="space-y-1">
                    <div className="flex items-baseline justify-between text-xs text-gray-500">
                      <span className="font-medium text-gray-700">
                        {n.mes}
                      </span>
                      <span className="font-semibold text-gray-700">
                        {n.nps.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${Math.max(0, Math.min(100, n.nps))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/*  
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Ranking ventas (taller)</p>
          <p className="text-2xl font-bold text-gray-900">
            #{data.ranking_talleres.ran_vendido || "-"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Ranking NPS (taller)</p>
          <p className="text-2xl font-bold text-gray-900">
            #{data.ranking_talleres.ran_nps || "-"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Ranking ventas (sede)</p>
          <p className="text-2xl font-bold text-gray-900">
            #{data.ranking_sedes.ran_vendido || "-"}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Ranking NPS (sede)</p>
          <p className="text-2xl font-bold text-gray-900">
            #{data.ranking_sedes.ran_nps || "-"}
          </p>
        </div>
      </div>

      */ }
      {data.ranking_presupuesto && data.ranking_presupuesto.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden shadow border border-gray-100">
          <h3 className="text-lg font-semibold p-4 border-b">Ranking mensual</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Técnico
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Rptos
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    M.O
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.ranking_presupuesto.map((row, idx) => (
                  <tr key={`${row.operario}-${idx}`}>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.tecnico}</td>
                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(row.rptos)}</td>
                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(row.MO)}</td>
                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(row.suma_todo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export const DashboardTecnicos = memo(DashboardTecnicosInner);
