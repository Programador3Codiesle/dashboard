"use client";

import { memo } from "react";
import type { DashboardTecnicos as DashboardTecnicosType } from "../types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function DashboardTecnicosInner({ data }: { data: DashboardTecnicosType }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Informe Técnicos</h2>
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
      {data.ranking_presupuesto && data.ranking_presupuesto.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden shadow border border-gray-100">
          <h3 className="text-lg font-semibold p-4 border-b">Ranking presupuesto</h3>
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
