'use client';

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { informeEntradaVhService } from "@/modules/informes/postventa/services/entrada-vh.service";
import {
  formatCantidadCo,
  formatNumeroCo,
} from "@/modules/informes/postventa/format-cantidad-co";
import { useToast } from "@/components/ui/use-toast";

function getCurrentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function LlegadaVehiculosPage() {
  const { showError } = useToast();
  const [yearMonth, setYearMonth] = useState<string>(getCurrentYearMonth);

  const filtros = useMemo(() => {
    const [yearStr, monthStr] = yearMonth.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    return { year, month };
  }, [yearMonth]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["informes", "postventa", "entrada-vh", filtros],
    queryFn: () => informeEntradaVhService.obtenerResumen(filtros.year, filtros.month),
    enabled: !!filtros.year && !!filtros.month,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isError) return;
    showError(
      "No se pudo cargar el informe de entrada de vehículos al taller. Verifica los filtros e inténtalo nuevamente.",
    );
  }, [isError, showError]);

  const toPercent = (value: number) => `${formatNumeroCo(value, 0, 0)}%`;

  const citasCumplidas = data
    ? [
        { label: "Asistidas", value: data.citasAsistidas, color: "#22c55e" },
        { label: "No asistidas", value: Math.max(0, data.citasAgendadas - data.citasAsistidas), color: "#ef4444" },
      ]
    : [];

  const estadoCitas = data
    ? [
        { label: "Temprano", value: data.cantidadTemprano, color: "#14b8a6" },
        { label: "A tiempo", value: data.cantidadAtiempo, color: "#3b82f6" },
        { label: "Llegó tarde", value: data.cantidadTarde, color: "#f59e0b" },
      ]
    : [];

  const vhAgendados = data
    ? [
        { label: "Sin cita", value: data.vhSinCita, color: "#f97316" },
        { label: "Con cita", value: data.citasAsistidas, color: "#6366f1" },
      ]
    : [];

  const getConic = (items: { value: number; color: string }[]) => {
    const total = items.reduce((acc, it) => acc + it.value, 0);
    if (!total) return "conic-gradient(#e5e7eb 0 100%)";
    let acc = 0;
    const parts = items.map((it) => {
      const start = (acc / total) * 100;
      acc += it.value;
      const end = (acc / total) * 100;
      return `${it.color} ${start}% ${end}%`;
    });
    return `conic-gradient(${parts.join(", ")})`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Informe entrada de vehículos Taller
        </h1>
        <p className="text-gray-500 mt-1">
          Analiza el cumplimiento de citas y la proporción de vehículos agendados versus los que ingresan sin cita.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm space-y-4 max-w-md">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1 max-w-xs">
            <label className="text-sm font-medium text-gray-700">
              Año / Mes
            </label>
            <input
              type="month"
              className="form-input rounded-lg border border-gray-300 px-3 py-1 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
              value={yearMonth}
              onChange={(e) => setYearMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm space-y-6">
        {isLoading && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}

        {!isLoading && !data && (
          <p className="text-sm text-gray-500">
            Selecciona un año y mes para ver el informe.
          </p>
        )}

        {!isLoading && data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-(--color-primary) text-white p-4 shadow-sm">
                <h2 className="text-sm font-medium opacity-80">
                  Porcentaje Citas Cumplidas
                </h2>
                <p className="mt-2 text-3xl font-bold">
                  {toPercent(data.porcentajeCitasCumplidas)}
                </p>
                <p className="mt-1 text-xs opacity-80">
                  Citas asistidas: {formatCantidadCo(data.citasAsistidas)} /{" "}
                  agendadas: {formatCantidadCo(data.citasAgendadas)}
                </p>
              </div>

              <div className="rounded-xl bg-blue-600 text-white p-4 shadow-sm">
                <h2 className="text-sm font-medium opacity-80">
                  Cumplimiento de Citas
                </h2>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Temprano</span>
                    <span>
                      {toPercent(data.porcentajeTemprano)} (
                      {formatCantidadCo(data.cantidadTemprano)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>A tiempo</span>
                    <span>
                      {toPercent(data.porcentajeAtiempo)} (
                      {formatCantidadCo(data.cantidadAtiempo)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Llegó tarde</span>
                    <span>
                      {toPercent(data.porcentajeTarde)} (
                      {formatCantidadCo(data.cantidadTarde)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500 text-white p-4 shadow-sm">
                <h2 className="text-sm font-medium opacity-80">
                  Porcentaje VH Agendados
                </h2>
                <p className="mt-2 text-3xl font-bold">
                  {toPercent(data.porcentajeVhAgendados)}
                </p>
                <p className="mt-1 text-xs opacity-80">
                  VH sin cita: {formatCantidadCo(data.vhSinCita)} / total
                  ingresos: {formatCantidadCo(data.totalIngresos)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Citas Cumplidas", items: citasCumplidas, total: data.citasAgendadas },
                { title: "Estado de Citas", items: estadoCitas, total: data.citasAsistidas },
                { title: "Vehículos Agendados", items: vhAgendados, total: data.totalIngresos },
              ].map((card) => (
                <div key={card.title} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">{card.title}</h3>
                  <div className="flex items-center gap-4">
                    <div
                      className="h-24 w-24 rounded-full shrink-0"
                      style={{ background: getConic(card.items) }}
                    >
                      <div className="h-full w-full scale-[0.62] rounded-full bg-white" />
                    </div>
                    <div className="space-y-1 text-xs w-full">
                      {card.items.map((it) => (
                        <div key={it.label} className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-2 text-gray-600">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: it.color }} />
                            {it.label}
                          </span>
                          <span className="font-semibold text-gray-800">
                            {formatCantidadCo(it.value)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-1 text-gray-500">
                        Total: {formatCantidadCo(card.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-100 p-4 md:p-5 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Resumen numérico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-600">Citas agendadas</span>
                  <span className="font-medium">
                    {formatCantidadCo(data.citasAgendadas)}
                  </span>
                </div>
                <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-600">Citas asistidas</span>
                  <span className="font-medium">
                    {formatCantidadCo(data.citasAsistidas)}
                  </span>
                </div>
                <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-600">VH sin cita</span>
                  <span className="font-medium">
                    {formatCantidadCo(data.vhSinCita)}
                  </span>
                </div>
                <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-600">Total ingresos</span>
                  <span className="font-medium">
                    {formatCantidadCo(data.totalIngresos)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

