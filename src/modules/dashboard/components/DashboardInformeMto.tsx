"use client";

import { memo } from "react";
import type { DashboardInformeMto as DashboardInformeMtoType } from "../types";

function DashboardInformeMtoInner({ data }: { data: DashboardInformeMtoType }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">
        Informe solicitud de mantenimiento
      </h2>
      <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
        <p className="text-sm text-gray-600">Fecha actual</p>
        <p className="text-lg font-medium text-gray-900">{data.fecha_actual}</p>
        {data.dia_festivo === 1 && (
          <p className="text-sm text-amber-600 mt-1">Día festivo</p>
        )}
      </div>
      <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen solicitudes de mantenimiento
        </h3>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Mantenimiento correctivo
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500 uppercase">Pendientes</p>
            <p className="text-xl font-bold text-gray-900">{data.pendientes}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500 uppercase">En proceso</p>
            <p className="text-xl font-bold text-gray-900">{data.proceso}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500 uppercase">Finalizadas</p>
            <p className="text-xl font-bold text-gray-900">{data.finalizadas}</p>
          </div>
        </div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Mantenimiento preventivo (hoy)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-100 p-2">
            <p className="text-xs text-gray-500">Pendientes</p>
            <p className="text-lg font-semibold">{data.pendientesPre}</p>
          </div>
          <div className="rounded-lg border border-gray-100 p-2">
            <p className="text-xs text-gray-500">En proceso</p>
            <p className="text-lg font-semibold">{data.procesoPre}</p>
          </div>
          <div className="rounded-lg border border-gray-100 p-2">
            <p className="text-xs text-gray-500">Finalizadas</p>
            <p className="text-lg font-semibold">{data.finalizadasPre}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const DashboardInformeMto = memo(DashboardInformeMtoInner);
