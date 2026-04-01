'use client';

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { informeEntradaVhService } from "@/modules/informes/postventa/services/entrada-vh.service";
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

  if (isError) {
    showError(
      "No se pudo cargar el informe de entrada de vehículos al taller. Verifica los filtros e inténtalo nuevamente.",
    );
  }

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

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Año / Mes
            </label>
            <input
              type="month"
              className="form-input rounded-lg border-gray-300 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
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
                  {Math.round(data.porcentajeCitasCumplidas)}%
                </p>
                <p className="mt-1 text-xs opacity-80">
                  Citas asistidas: {data.citasAsistidas.toLocaleString("es-CO")} /{" "}
                  agendadas: {data.citasAgendadas.toLocaleString("es-CO")}
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
                      {Math.round(data.porcentajeTemprano)}% (
                      {data.cantidadTemprano.toLocaleString("es-CO")})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>A tiempo</span>
                    <span>
                      {Math.round(data.porcentajeAtiempo)}% (
                      {data.cantidadAtiempo.toLocaleString("es-CO")})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Llegó tarde</span>
                    <span>
                      {Math.round(data.porcentajeTarde)}% (
                      {data.cantidadTarde.toLocaleString("es-CO")})
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-500 text-white p-4 shadow-sm">
                <h2 className="text-sm font-medium opacity-80">
                  Porcentaje VH Agendados
                </h2>
                <p className="mt-2 text-3xl font-bold">
                  {Math.round(data.porcentajeVhAgendados)}%
                </p>
                <p className="mt-1 text-xs opacity-80">
                  VH sin cita: {data.vhSinCita.toLocaleString("es-CO")} / total
                  ingresos: {data.totalIngresos.toLocaleString("es-CO")}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 p-4 md:p-5 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Resumen numérico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-600">Citas agendadas</span>
                  <span className="font-medium">
                    {data.citasAgendadas.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-600">Citas asistidas</span>
                  <span className="font-medium">
                    {data.citasAsistidas.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-600">VH sin cita</span>
                  <span className="font-medium">
                    {data.vhSinCita.toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="flex justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                  <span className="text-gray-600">Total ingresos</span>
                  <span className="font-medium">
                    {data.totalIngresos.toLocaleString("es-CO")}
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

