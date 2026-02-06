"use client";

import { memo } from "react";
import type { DashboardJefeTaller as DashboardJefeTallerType } from "../types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function DashboardJefeTallerInner({ data }: { data: DashboardJefeTallerType }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Informe diario Taller</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Vendido</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.total_ventas)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total M.O</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.mo)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total TOT</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.tot)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Rptos</p>
          <p className="text-2xl font-bold text-gray-900">
            ${formatCurrency(data.rep)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Horas Facturadas</p>
          <p className="text-2xl font-bold text-gray-900">{data.horas_fac}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">NPS Interno</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(data.nps_int)}%
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">NPS Colmotores</p>
        <p className="text-2xl font-bold text-gray-900">
          {Math.round(data.nps_col)}%
        </p>
      </div>
      {data.data_bodegas.length > 0 && (
        <div className="bg-white rounded-xl overflow-hidden shadow border border-gray-100">
          <h3 className="text-lg font-semibold p-4 border-b">Detalle por bodega</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Técnico
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Orden
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    Rptos
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                    M.O
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.data_bodegas.map((row) => (
                  <tr key={`${row.numero_orden}-${row.operario}`}>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.tecnico}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.numero_orden}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.cliente}</td>
                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(row.rptos)}</td>
                    <td className="px-4 py-2 text-sm text-right">{formatCurrency(row.MO)}</td>
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

export const DashboardJefeTaller = memo(DashboardJefeTallerInner);
