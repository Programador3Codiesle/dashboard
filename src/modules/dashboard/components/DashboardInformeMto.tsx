"use client";

import { memo } from "react";
import type { DashboardInformeMto as DashboardInformeMtoType } from "../types";

function DashboardInformeMtoInner({ data }: { data: DashboardInformeMtoType }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">
        Informe solicitud de mantenimiento
      </h2>
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-white shadow-md text-sm">
          <span className="font-semibold">Fecha:</span>
          <span className="text-base font-semibold">{data.fecha_actual}</span>
          {data.dia_festivo === 1 && (
            <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[0.7rem] font-medium">
              Día festivo
            </span>
          )}
        </div>
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
