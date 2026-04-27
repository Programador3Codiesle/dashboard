'use client';

import { useQuery } from "@tanstack/react-query";
import {
  kpiService,
  type KpiSedeMensual,
  type KpiTecnicoDetallado,
} from "@/modules/informes/postventa/services/kpi.service";
import { useState, useMemo, useEffect } from "react";
import { Pagination } from "@/components/shared/ui/Pagination";
import { formatCantidadCo } from "@/modules/informes/postventa/format-cantidad-co";

type SeccionKpi = "mantPrev" | "cargoCli" | "tecnicos";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const PAGE_SIZE = 10;

export default function KpiPage() {
  const [seccion, setSeccion] = useState<SeccionKpi>("mantPrev");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["informes", "postventa", "kpi"],
    queryFn: () => kpiService.obtenerResumen(),
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [seccion]);

  const mantCargoRows = useMemo((): KpiSedeMensual[] => {
    if (!data) return [];
    if (seccion === "mantPrev") return data.mantenimientoPreventivo;
    if (seccion === "cargoCli") return data.cargoCliente;
    return [];
  }, [data, seccion]);

  const tecnicosRowsFull = useMemo((): KpiTecnicoDetallado[] => {
    if (!data || seccion !== "tecnicos") return [];
    return data.tecnicos;
  }, [data, seccion]);

  const totalItems =
    seccion === "tecnicos" ? tecnicosRowsFull.length : mantCargoRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const paginatedMantCargo = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return mantCargoRows.slice(start, start + PAGE_SIZE);
  }, [mantCargoRows, currentPage]);

  const paginatedTecnicos = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return tecnicosRowsFull.slice(start, start + PAGE_SIZE);
  }, [tecnicosRowsFull, currentPage]);

  const renderTablaSedes = (titulo: string, rows: KpiSedeMensual[]) => {
    if (!rows || rows.length === 0) {
      return (
        <p className="text-sm text-gray-500 mt-2">
          No hay información disponible para esta sección.
        </p>
      );
    }

    return (
      <>
        <h2 className="text-lg font-semibold mb-3 brand-text">{titulo}</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Sede</th>
                {MESES.map((mes) => (
                  <th
                    key={mes}
                    className="px-3 py-2 text-center font-semibold whitespace-nowrap"
                  >
                    {mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, index) => (
                <tr key={`${row.sede}-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {row.sede}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.enero)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.febrero)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.marzo)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.abril)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.mayo)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.junio)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.julio)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.agosto)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.septiembre)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.octubre)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.noviembre)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {formatCantidadCo(row.diciembre)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderTablaTecnicos = (tecnicos: KpiTecnicoDetallado[]) => {
    if (tecnicos.length === 0) {
      return (
        <p className="text-sm text-gray-500 mt-2">
          No hay información disponible para esta sección.
        </p>
      );
    }

    return (
      <>
        <h2 className="text-lg font-semibold mb-3 brand-text">
          FACTURACIÓN TOTAL Y OT POR TÉCNICO
        </h2>
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
            <thead className="bg-(--color-primary) text-white">
              <tr>
                <th className="px-4 py-2 text-left font-semibold whitespace-nowrap">
                  Técnico
                </th>
                {MESES.map((mes) => (
                  <th
                    key={mes}
                    className="px-3 py-2 text-center font-semibold whitespace-nowrap"
                  >
                    {mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tecnicos.map((tec, index) => (
                <tr
                  key={`${tec.operario}-${tec.tecnico}-${index}`}
                  className="align-top hover:bg-gray-50"
                >
                  <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                    {tec.tecnico}
                  </td>
                  {MESES.map((mes, idx) => {
                    const key = MESES[idx].toLowerCase() as keyof typeof tec.ot;
                    const ot = tec.ot[key] as number;
                    const rep = tec.repuestos[key] as number;
                    const mo = tec.manoObra[key] as number;
                    return (
                      <td key={mes} className="px-2 py-2 text-center">
                        <table className="mx-auto text-[11px] md:text-xs">
                          <tbody>
                            <tr>
                              <th className="pr-1 font-semibold text-gray-700">
                                OT
                              </th>
                              <td className="text-right">{formatCantidadCo(ot)}</td>
                            </tr>
                            <tr>
                              <th className="pr-1 font-semibold text-gray-700">
                                REP
                              </th>
                              <td className="text-right">
                                {formatCantidadCo(rep)}
                              </td>
                            </tr>
                            <tr>
                              <th className="pr-1 font-semibold text-gray-700">
                                MO
                              </th>
                              <td className="text-right">
                                {formatCantidadCo(mo)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Informe KPI
        </h1>
        <p className="text-gray-500 mt-1">
          Visualiza los indicadores clave de mantenimiento preventivo, cargo a
          cliente y facturación por técnico.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-700 mr-2">
            Sección:
          </span>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                className="form-radio text-(--color-primary)"
                checked={seccion === "mantPrev"}
                onChange={() => setSeccion("mantPrev")}
              />
              <span className="text-sm text-gray-800">
                Cantidad OT mantenimiento preventivo
              </span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                className="form-radio text-(--color-primary)"
                checked={seccion === "cargoCli"}
                onChange={() => setSeccion("cargoCli")}
              />
              <span className="text-sm text-gray-800">
                Cantidad OT cargo a cliente
              </span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                className="form-radio text-(--color-primary)"
                checked={seccion === "tecnicos"}
                onChange={() => setSeccion("tecnicos")}
              />
              <span className="text-sm text-gray-800">
                FACTURACIÓN TOTAL Y OT POR TÉCNICO
              </span>
            </label>
          </div>
        </div>

        {isLoading && (
          <div className="mt-2 flex min-h-[240px] items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
            <p className="text-sm text-gray-500">Cargando información...</p>
          </div>
        )}
        {isError && (
          <p className="text-sm text-red-500">
            Ocurrió un error al cargar los datos del informe KPI.
          </p>
        )}

        {!isLoading && !isError && data && (
          <div className="mt-2 space-y-4">
            {seccion === "mantPrev" &&
              renderTablaSedes(
                "Cantidad OT mantenimiento preventivo",
                paginatedMantCargo,
              )}
            {seccion === "cargoCli" &&
              renderTablaSedes(
                "Cantidad OT cargo a cliente",
                paginatedMantCargo,
              )}
            {seccion === "tecnicos" &&
              renderTablaTecnicos(paginatedTecnicos)}
            {totalItems > 0 && (
              <div className="pt-2 flex justify-center border-t border-gray-100">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

