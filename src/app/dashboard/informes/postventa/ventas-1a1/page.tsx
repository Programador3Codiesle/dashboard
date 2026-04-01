'use client';

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ventas1a1Service,
  Ventas1a1Asesor,
  Ventas1a1Row,
} from "@/modules/informes/postventa/services/ventas-1a1.service";
import { useToast } from "@/components/ui/use-toast";

function getCurrentYear(): number {
  return new Date().getFullYear();
}

export default function Ventas1a1Page() {
  const { showError } = useToast();
  const [year, setYear] = useState<number>(getCurrentYear);
  const [asesor, setAsesor] = useState<string>("");

  const {
    data: asesores,
    isLoading: loadingAsesores,
    isError: errorAsesores,
  } = useQuery<Ventas1a1Asesor[]>({
    queryKey: ["informes", "postventa", "ventas-1a1", "asesores"],
    queryFn: () => ventas1a1Service.listarAsesores(),
    staleTime: 5 * 60 * 1000,
  });

  const filtros = useMemo(
    () => ({
      year,
      asesor: asesor || null,
    }),
    [year, asesor],
  );

  const {
    data: filas,
    isLoading: loadingInforme,
    isError: errorInforme,
    refetch,
  } = useQuery<Ventas1a1Row[], Error>({
    queryKey: ["informes", "postventa", "ventas-1a1", filtros],
    queryFn: () => ventas1a1Service.obtenerInforme(filtros.year, filtros.asesor),
    enabled: !!filtros.year,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (errorAsesores || errorInforme) {
      showError(
        "No se pudo cargar el informe de Ventas 1 a 1. Verifica los filtros e inténtalo nuevamente.",
      );
    }
  }, [errorAsesores, errorInforme, showError]);

  const onBuscar = () => {
    if (!year || year < 2020 || year > getCurrentYear()) {
      showError(
        `Debes seleccionar un año desde 2020 hasta ${getCurrentYear()}.`,
      );
      return;
    }
    refetch();
  };

  const limpiar = () => {
    setYear(getCurrentYear());
    setAsesor("");
  };

  const rows = filas ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Ventas 1 a 1
        </h1>
        <p className="text-gray-500 mt-1">
          Informe general de ventas 1 a 1 por asesor, mostrando venta de mano
          de obra, repuestos, costo y utilidad.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Año</label>
            <input
              type="number"
              min={2020}
              max={getCurrentYear()}
              className="form-input rounded-lg border-gray-300 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Asesor</label>
            <select
              className="form-select rounded-lg border-gray-300 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
              value={asesor}
              onChange={(e) => setAsesor(e.target.value)}
              disabled={loadingAsesores}
            >
              <option value="">Todos los asesores</option>
              {asesores?.map((a) => (
                <option key={a.nitAsesor} value={a.nitAsesor}>
                  {a.asesor} ({a.nitAsesor})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBuscar}
              className="inline-flex-1 w-full justify-center rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
            >
              Buscar
            </button>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex-1 w-full justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Recargar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {loadingInforme && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}

        {!loadingInforme && rows.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay información para los filtros seleccionados.
          </p>
        )}

        {!loadingInforme && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold">#</th>
                  <th className="px-3 py-2 text-center font-semibold">Año</th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Nit Asesor
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Asesor
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Mano de obra
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Venta repuestos
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Costo repuestos
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Utilidad
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    % Conversión (entradas/ventas)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, index) => (
                  <tr key={`${row.nitAsesor}-${row.anio}-${index}`}>
                    <td className="px-3 py-1.5 text-center">
                      {index + 1}
                    </td>
                    <td className="px-3 py-1.5 text-center">{row.anio}</td>
                    <td className="px-3 py-1.5 text-center">
                      {row.nitAsesor}
                    </td>
                    <td className="px-3 py-1.5 text-center">{row.asesor}</td>
                    <td className="px-3 py-1.5 text-right">
                      {row.ventaManoObra.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.ventaRepuestos.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.costoRepuestos.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {row.utilidad.toLocaleString("es-CO")}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      {row.porcentajeConversion !== null
                        ? `${row.porcentajeConversion.toFixed(2)}%`
                        : "-"}
                    </td>
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

