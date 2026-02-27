"use client";

import { memo } from "react";
import type { DashboardAgenteCC as DashboardAgenteCCType } from "../types";

function DashboardAgenteCCInner({ data }: { data: DashboardAgenteCCType }) {
  const estadoActual =
    data.data_estado?.length && data.data_estado[0].estado
      ? data.data_estado[0].estado
      : "Inactivo";
  const isActivo = estadoActual === "Activo";

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Agente Call Center</h2>
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
        <h3 className="font-bold text-gray-900 mb-3">Cambiar estado</h3>
        <div className="flex items-center gap-3">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{
              backgroundColor: isActivo ? "var(--color-primary)" : "#9ca3af",
            }}
          />
          <span className="text-gray-700">
            Estado actual:{" "}
            <span
              className={
                isActivo ? "text-green-600 font-medium" : "text-red-600 font-medium"
              }
            >
              {estadoActual}
            </span>
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Última modificación automática al cambiar el estado. El cambio de
          estado se realiza desde el módulo correspondiente.
        </p>
      </div>
    </div>
  );
}

export const DashboardAgenteCC = memo(DashboardAgenteCCInner);
