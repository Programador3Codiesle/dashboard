"use client";

import { memo } from "react";
import type { DashboardAdmin as DashboardAdminType } from "../types";

const SEDE_LABELS: Record<string, string> = {
  giron: "Girón",
  rosita: "La Rosita",
  barranca: "Barranca",
  bocono: "Bocono",
  solochevrolet: "Solo Chevrolet",
  chevropartes: "Chevropartes",
};

function ProgressBar({
  value,
  label,
  max = 100,
}: {
  value: number;
  label: string;
  max?: number;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full brand-bg transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DashboardAdminInner({ data }: { data: DashboardAdminType }) {
  const hasPorcen =
    data.porcen_giron != null ||
    data.porcen_rosita != null ||
    data.porcen_barranca != null ||
    data.porcen_bocono != null ||
    data.porcen_soloc != null ||
    data.porcen_chev != null;
  const hasMto =
    data.pendientes != null ||
    data.proceso != null ||
    data.finalizadas != null ||
    data.pendientesPre != null ||
    data.procesoPre != null ||
    data.finalizadasPre != null;
  const grafSedes = data.graf_sedes ?? [];
  const maxGraf = grafSedes.length
    ? Math.max(...grafSedes.map((s) => s.total), 1)
    : 1;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Panel Administrativo</h2>

      <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
        <p className="text-sm text-gray-600">Fecha actual</p>
        <p className="text-lg font-medium text-gray-900">{data.fecha_actual}</p>
        {data.dia_festivo === 1 && (
          <p className="text-sm text-amber-600 mt-1">Día festivo</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.nps_int != null && (
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <p className="text-sm text-gray-600">NPS Codiesel</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(data.nps_int)}%
            </p>
          </div>
        )}
        {data.cal_pac?.Calificacion != null && (
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <p className="text-sm text-gray-600">NPS Colmotores (PAC)</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.cal_pac.Calificacion}%
            </p>
          </div>
        )}
        {data.to_posv != null && (
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <p className="text-sm text-gray-600">Total Postventa</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat("es-CO").format(data.to_posv)}
            </p>
          </div>
        )}
        {data.to_inv != null && (
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <p className="text-sm text-gray-600">Valor inventario</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat("es-CO").format(data.to_inv)}
            </p>
          </div>
        )}
      </div>

      {grafSedes.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Total vendido POSVENTA
          </h3>
          <div className="space-y-3">
            {grafSedes.map((s) => (
              <div key={s.sede} className="flex items-center gap-4">
                <span className="w-32 text-sm text-gray-600 capitalize">
                  {SEDE_LABELS[s.sede] ?? s.sede}
                </span>
                <div className="flex-1 h-6 rounded-md bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-md brand-bg"
                    style={{
                      width: `${Math.min(100, (s.total / maxGraf) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 w-28 text-right">
                  {new Intl.NumberFormat("es-CO").format(s.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasPorcen && (
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Porcentaje objetivo por sede (mes)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.porcen_giron != null && (
              <ProgressBar
                value={data.porcen_giron}
                label="Girón"
                max={100}
              />
            )}
            {data.porcen_rosita != null && (
              <ProgressBar
                value={data.porcen_rosita}
                label="La Rosita"
                max={100}
              />
            )}
            {data.porcen_barranca != null && (
              <ProgressBar
                value={data.porcen_barranca}
                label="Barranca"
                max={100}
              />
            )}
            {data.porcen_bocono != null && (
              <ProgressBar
                value={data.porcen_bocono}
                label="Bocono"
                max={100}
              />
            )}
            {data.porcen_soloc != null && (
              <ProgressBar
                value={data.porcen_soloc}
                label="Solo Chevrolet"
                max={100}
              />
            )}
            {data.porcen_chev != null && (
              <ProgressBar
                value={data.porcen_chev}
                label="Chevropartes"
                max={100}
              />
            )}
          </div>
        </div>
      )}

      {data.data_estado && data.data_estado.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Estado agente
          </h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {data.data_estado.map((e, i) => (
              <li key={i}>{e.estado || "—"}</li>
            ))}
          </ul>
        </div>
      )}

      {hasMto && (
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Solicitudes de mantenimiento
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 uppercase">Pendientes</p>
              <p className="text-xl font-bold text-gray-900">
                {data.pendientes ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 uppercase">En proceso</p>
              <p className="text-xl font-bold text-gray-900">
                {data.proceso ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 uppercase">Finalizadas</p>
              <p className="text-xl font-bold text-gray-900">
                {data.finalizadas ?? 0}
              </p>
            </div>
          </div>
          <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">
            Preventivo (hoy)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-100 p-2">
              <p className="text-xs text-gray-500">Pendientes</p>
              <p className="text-lg font-semibold">{data.pendientesPre ?? 0}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-2">
              <p className="text-xs text-gray-500">En proceso</p>
              <p className="text-lg font-semibold">{data.procesoPre ?? 0}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-2">
              <p className="text-xs text-gray-500">Finalizadas</p>
              <p className="text-lg font-semibold">{data.finalizadasPre ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {!data.nps_int &&
        data.cal_pac?.Calificacion == null &&
        data.to_posv == null &&
        data.to_inv == null &&
        !grafSedes.length &&
        !hasPorcen &&
        !hasMto &&
        (!data.data_estado || data.data_estado.length === 0) && (
          <p className="text-gray-500">Sin métricas adicionales para tu perfil.</p>
        )}
    </div>
  );
}

export const DashboardAdmin = memo(DashboardAdminInner);
