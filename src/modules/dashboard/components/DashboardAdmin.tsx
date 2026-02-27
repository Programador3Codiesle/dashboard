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

  // Colores según nivel de cumplimiento
  // < 80%: rojo (malo), 80-90%: amarillo (bueno), >= 90%: verde (muy bueno).
  let barColor = "bg-red-500";
  let textColor = "text-red-600";
  if (pct >= 90) {
    barColor = "bg-emerald-500";
    textColor = "text-emerald-600";
  } else if (pct >= 80) {
    barColor = "bg-amber-400";
    textColor = "text-amber-600";
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${textColor}`}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
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
  const sedesPresupuesto = data.sedes_presupuesto ?? [];
  const sedesTalleres = data.sedes_talleres ?? [];
  const sedesTalleresIndex = new Map(
    sedesTalleres.map((s) => [s.key, s.talleres])
  );
  const hasSedesDetalle = sedesTalleres.length > 0;

  const sedesParaUi =
    sedesPresupuesto.length > 0
      ? sedesPresupuesto
      : hasSedesDetalle
      ? sedesTalleres.map((sede) => ({
          key: sede.key,
          sede: sede.sede,
          presupuesto: 0,
          total: sede.talleres.reduce(
            (acc, t) => acc + (t.total ?? 0),
            0
          ),
          porcentaje: 0,
          metaCumplida: false,
        }))
      : [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Panel Administrativo</h2>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">NPS Codiesel</p>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(data.nps_int ?? 0)}%{" "}
            <span className="text-sm font-normal text-gray-500">/ 81%</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">NPS Colmotores (PAC)</p>
          <p className="text-2xl font-bold text-gray-900">
            {(data.cal_pac?.Calificacion ?? 0)}%{" "}
            <span className="text-sm font-normal text-gray-500">/ 81%</span>
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Total Postventa</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("es-CO", {
              maximumFractionDigits: 0,
            }).format(Math.round(data.to_posv ?? 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <p className="text-sm text-gray-600">Valor inventario</p>
          <p className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat("es-CO", {
              maximumFractionDigits: 0,
            }).format(Math.round(data.to_inv ?? 0))}
          </p>
        </div>
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
                  {new Intl.NumberFormat("es-CO", {
                    maximumFractionDigits: 0,
                  }).format(Math.round(s.total))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {(sedesParaUi.length > 0 || hasPorcen || hasSedesDetalle) && (
        <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Desempeño mensual por sede
          </h3>
          {sedesParaUi.length > 0 && (
            <div className="mb-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 flex flex-wrap items-center justify-between gap-2">
              {(() => {
                const totalPresupuesto = sedesParaUi.reduce(
                  (acc, sede) => acc + sede.presupuesto,
                  0
                );
                const totalVendido = sedesParaUi.reduce(
                  (acc, sede) => acc + sede.total,
                  0
                );
                const porcentajeGeneral =
                  totalPresupuesto > 0
                    ? (totalVendido * 100) / totalPresupuesto
                    : undefined;
                return (
                  <>
                    <span className="font-semibold text-gray-900">
                      Codiesel (general)
                    </span>
                    <span>
                      Meta:{" "}
                      <span className="font-medium text-gray-900">
                        $
                        {new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 0,
                        }).format(Math.round(totalPresupuesto))}
                      </span>
                    </span>
                    <span>
                      Vendido:{" "}
                      <span className="font-medium text-gray-900">
                        $
                        {new Intl.NumberFormat("es-CO", {
                          maximumFractionDigits: 0,
                        }).format(Math.round(totalVendido))}
                      </span>
                    </span>
                    {porcentajeGeneral != null && (
                      <span>
                        Porcentaje:{" "}
                        <span className="font-medium text-gray-900">
                          {porcentajeGeneral.toFixed(1)}%
                        </span>
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
            {sedesParaUi.length > 0
              ? sedesParaUi.map((sede) => (
                  <div
                    key={sede.key}
                    className="rounded-xl border border-gray-100 p-4 flex flex-col gap-3 bg-gradient-to-br from-white via-white to-[var(--color-primary-light)]/20"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {sede.sede}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sede.metaCumplida
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {sede.metaCumplida ? "Meta cumplida" : "En progreso"}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        Meta:{" "}
                        <span className="font-medium text-gray-900">
                          $
                          {new Intl.NumberFormat("es-CO", {
                            maximumFractionDigits: 0,
                          }).format(Math.round(sede.presupuesto))}
                        </span>
                      </span>
                      <span>
                        Vendido:{" "}
                        <span className="font-medium text-gray-900">
                          $
                          {new Intl.NumberFormat("es-CO", {
                            maximumFractionDigits: 0,
                          }).format(Math.round(sede.total))}
                        </span>
                      </span>
                    </div>
                    <ProgressBar
                      value={sede.porcentaje ?? 0}
                      label="Cumplimiento mensual"
                      max={100}
                    />
                    {sedesTalleresIndex.get(sede.key)?.length ? (
                      <details className="mt-2 border-t border-gray-100 pt-2 text-gray-600">
                        <summary className="cursor-pointer text-xs font-medium text-gray-700 uppercase tracking-wide">
                          Ver detalle por taller
                        </summary>
                        <div className="mt-1.5 space-y-1.5">
                          {sedesTalleresIndex.get(sede.key)!.map((taller) => (
                            <div
                              key={taller.nombre}
                              className="flex items-start gap-3 border-b border-gray-100 pb-1.5 last:border-0 last:pb-0 min-w-0"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {taller.nombre}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  Meta:{" "}
                                  <span className="font-medium text-gray-900">
                                    $
                                    {new Intl.NumberFormat("es-CO", {
                                      maximumFractionDigits: 0,
                                    }).format(Math.round(taller.presupuesto ?? 0))}
                                  </span>
                                  {" · "}
                                  Vendido:{" "}
                                  <span className="font-medium text-gray-900">
                                    $
                                    {new Intl.NumberFormat("es-CO", {
                                      maximumFractionDigits: 0,
                                    }).format(Math.round(taller.total))}
                                  </span>
                                  {" · "}
                                  <span className={taller.metaCumplida ? "text-green-600 font-medium" : "text-gray-700"}>
                                    {taller.porcentaje}%
                                  </span>
                                </p>
                                {(taller.mo != null ||
                                  taller.tot != null ||
                                  taller.rep != null) && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {taller.mo != null && (
                                      <span>
                                        MO:{" "}
                                        <span className="font-medium text-gray-900">
                                          $
                                          {new Intl.NumberFormat("es-CO", {
                                            maximumFractionDigits: 0,
                                          }).format(Math.round(taller.mo))}
                                        </span>
                                      </span>
                                    )}
                                    {taller.tot != null && (
                                      <span>
                                        {" "}
                                        · TOT:{" "}
                                        <span className="font-medium text-gray-900">
                                          $
                                          {new Intl.NumberFormat("es-CO", {
                                            maximumFractionDigits: 0,
                                          }).format(Math.round(taller.tot))}
                                        </span>
                                      </span>
                                    )}
                                    {taller.rep != null && (
                                      <span>
                                        {" "}
                                        · REP:{" "}
                                        <span className="font-medium text-gray-900">
                                          $
                                          {new Intl.NumberFormat("es-CO", {
                                            maximumFractionDigits: 0,
                                          }).format(Math.round(taller.rep))}
                                        </span>
                                      </span>
                                    )}
                                  </p>
                                )}
                              </div>
                              <div className="shrink-0 w-[8.5rem]">
                                <ProgressBar
                                  value={taller.porcentaje}
                                  label="Cumplimiento"
                                  max={100}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                ))
              : [
                  data.porcen_giron != null && {
                    key: "giron",
                    sede: "Girón",
                    porcentaje: data.porcen_giron,
                  },
                  data.porcen_rosita != null && {
                    key: "rosita",
                    sede: "La Rosita",
                    porcentaje: data.porcen_rosita,
                  },
                  data.porcen_barranca != null && {
                    key: "barranca",
                    sede: "Barranca",
                    porcentaje: data.porcen_barranca,
                  },
                  data.porcen_bocono != null && {
                    key: "bocono",
                    sede: "Bocono",
                    porcentaje: data.porcen_bocono,
                  },
                  data.porcen_soloc != null && {
                    key: "solochevrolet",
                    sede: "Solo Chevrolet",
                    porcentaje: data.porcen_soloc,
                  },
                  data.porcen_chev != null && {
                    key: "chevropartes",
                    sede: "Chevropartes",
                    porcentaje: data.porcen_chev,
                  },
                ]
                  .filter(
                    (
                      sede
                    ): sede is {
                      key: string;
                      sede: string;
                      porcentaje: number;
                    } => Boolean(sede)
                  )
                  .map((sede) => (
                    <div
                      key={sede.key}
                      className="rounded-xl border border-gray-100 p-4 flex flex-col gap-3"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {sede.sede}
                      </p>
                      <ProgressBar
                        value={sede.porcentaje}
                        label="Cumplimiento mensual"
                        max={100}
                      />
                    </div>
                  ))}
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
