'use client';

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  encuestasInternasService,
  EncuestaInternaRow,
} from "@/modules/informes/postventa/services/encuestas-internas.service";
import { useToast } from "@/components/ui/use-toast";

function getDefaultStartDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function getDefaultEndDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export default function EncuestasInternasPage() {
  const { showError } = useToast();
  const [fechaInicio, setFechaInicio] = useState<string>(getDefaultStartDate);
  const [fechaFin, setFechaFin] = useState<string>(getDefaultEndDate);

  const [rows, setRows] = useState<EncuestaInternaRow[]>([]);

  const { isFetching, refetch } = useQuery<EncuestaInternaRow[], Error>({
    queryKey: ["informes", "postventa", "encuestas-internas", fechaInicio, fechaFin],
    queryFn: () =>
      encuestasInternasService.obtener({
        fechaInicio,
        fechaFin,
      }),
    enabled: false,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const onGenerar = async () => {
    if (!fechaInicio || !fechaFin) {
      showError("Debes seleccionar un rango de fechas.");
      return;
    }
    if (fechaInicio > fechaFin) {
      showError("La fecha inicial no puede ser mayor que la fecha final.");
      return;
    }
    const result = await refetch();
    if (!result.data && result.error) {
      showError(
        "No se pudo cargar el informe de encuestas internas. Verifica el rango de fechas e inténtalo nuevamente.",
      );
    } else if (result.data) {
      setRows(result.data);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Informe Encuestas Internas
        </h1>
        <p className="text-gray-500 mt-1">
          Consulta las encuestas internas realizadas a clientes por rango de fechas.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Desde
            </label>
            <input
              type="date"
              className="form-input rounded-lg border-gray-300 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Hasta
            </label>
            <input
              type="date"
              className="form-input rounded-lg border-gray-300 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isFetching}
              onClick={onGenerar}
              className="inline-flex items-center rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) disabled:opacity-60"
            >
              Generar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {isFetching && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}

        {!isFetching && rows.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay información para el rango de fechas seleccionado.
          </p>
        )}

        {!isFetching && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-[11px] md:text-xs">
              <thead className="bg-gray-50 text-center">
                <tr>
                  <th className="px-2 py-2 font-semibold">OT</th>
                  <th className="px-2 py-2 font-semibold">BODEGA</th>
                  <th className="px-2 py-2 font-semibold">FECHA OT</th>
                  <th className="px-2 py-2 font-semibold">PLACA</th>
                  <th className="px-2 py-2 font-semibold">NIT</th>
                  <th className="px-2 py-2 font-semibold">CLIENTE</th>
                  <th className="px-2 py-2 font-semibold">CELULAR</th>
                  <th className="px-2 py-2 font-semibold">TELÉFONO 1</th>
                  <th className="px-2 py-2 font-semibold">TELÉFONO 2</th>
                  <th className="px-2 py-2 font-semibold">CORREO</th>
                  <th className="px-2 py-2 font-semibold">FECHA ENCUESTA</th>
                  <th className="px-2 py-2 font-semibold">CALIFICACIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {rows.map((row) => (
                  <tr key={`${row.numeroOrden}-${row.fechaEncuesta}`}>
                    <td className="px-2 py-1.5">{row.numeroOrden}</td>
                    <td className="px-2 py-1.5">{row.bodega}</td>
                    <td className="px-2 py-1.5">
                      {new Date(row.fechaOt).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-2 py-1.5">{row.placa}</td>
                    <td className="px-2 py-1.5">{row.nit}</td>
                    <td className="px-2 py-1.5">{row.cliente}</td>
                    <td className="px-2 py-1.5">{row.celular ?? ""}</td>
                    <td className="px-2 py-1.5">{row.telefono1 ?? ""}</td>
                    <td className="px-2 py-1.5">{row.telefono2 ?? ""}</td>
                    <td className="px-2 py-1.5">{row.correo ?? ""}</td>
                    <td className="px-2 py-1.5">
                      {new Date(row.fechaEncuesta).toLocaleString("es-CO")}
                    </td>
                    <td className="px-2 py-1.5">{row.calificacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

