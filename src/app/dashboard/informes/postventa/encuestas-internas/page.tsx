'use client';

import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Pagination } from "@/components/shared/ui/Pagination";
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

const PAGE_SIZE = 10;

export default function EncuestasInternasPage() {
  const { showError } = useToast();
  const [fechaInicio, setFechaInicio] = useState<string>(getDefaultStartDate);
  const [fechaFin, setFechaFin] = useState<string>(getDefaultEndDate);

  const [rows, setRows] = useState<EncuestaInternaRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const solicitudEnCurso = useRef(false);

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, currentPage]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: () =>
      encuestasInternasService.obtener({
        fechaInicio,
        fechaFin,
      }),
    retry: false,
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
    if (solicitudEnCurso.current) {
      return;
    }
    solicitudEnCurso.current = true;
    try {
      const data = await mutateAsync();
      setRows(data);
      setCurrentPage(1);
    } catch {
      showError(
        "No se pudo cargar el informe de encuestas internas. Verifica el rango de fechas e inténtalo nuevamente.",
      );
    } finally {
      solicitudEnCurso.current = false;
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
              className="form-input w-full min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
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
              className="form-input w-full min-h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-(--color-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={onGenerar}
              className="inline-flex items-center rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) disabled:opacity-60"
            >
              Generar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {isPending && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}

        {!isPending && rows.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay información para el rango de fechas seleccionado.
          </p>
        )}

        {!isPending && rows.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span>
                {totalItems} registro{totalItems === 1 ? "" : "s"} ·{" "}
                {PAGE_SIZE} por página
              </span>
            </div>
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
                  {paginatedRows.map((row) => (
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
            <div className="pt-2 border-t border-gray-100 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

