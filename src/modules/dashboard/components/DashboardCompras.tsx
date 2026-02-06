"use client";

import { memo } from "react";
import type { DashboardCompras as DashboardComprasType } from "../types";

function DashboardComprasInner({ data }: { data: DashboardComprasType }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Compras</h2>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">Fecha actual</p>
        <p className="text-lg font-medium text-gray-900">{data.fecha_actual}</p>
        {data.dia_festivo === 1 && (
          <p className="text-sm text-amber-600 mt-1">Día festivo</p>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen solicitudes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100 flex items-center gap-4">
            <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm text-gray-600">Solicitudes pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.solicitudes_pendientes}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100 flex items-center gap-4">
            <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm text-gray-600">Solicitudes en proceso</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.solicitudes_proceso}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100 flex items-center gap-4">
            <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <div>
              <p className="text-sm text-gray-600">Solicitudes finalizadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.solicitudes_finalizadas}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const DashboardCompras = memo(DashboardComprasInner);
