'use client';

import { useQuery } from "@tanstack/react-query";
import { kpiService } from "@/modules/informes/postventa/services/kpi.service";
import { useState } from "react";

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

export default function KpiPage() {
  const [seccion, setSeccion] = useState<SeccionKpi>("mantPrev");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["informes", "postventa", "kpi"],
    queryFn: () => kpiService.obtenerResumen(),
  });

  const renderTablaSedes = (
    titulo: string,
    rows: ReturnType<typeof kpiService.obtenerResumen> extends Promise<infer R>
      ? R extends { mantenimientoPreventivo: infer A }
        ? A
        : never
      : never,
  ) => {
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
              {rows.map((row) => (
                <tr key={row.sede} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {row.sede}
                  </td>
                  <td className="px-3 py-2 text-center">{row.enero}</td>
                  <td className="px-3 py-2 text-center">{row.febrero}</td>
                  <td className="px-3 py-2 text-center">{row.marzo}</td>
                  <td className="px-3 py-2 text-center">{row.abril}</td>
                  <td className="px-3 py-2 text-center">{row.mayo}</td>
                  <td className="px-3 py-2 text-center">{row.junio}</td>
                  <td className="px-3 py-2 text-center">{row.julio}</td>
                  <td className="px-3 py-2 text-center">{row.agosto}</td>
                  <td className="px-3 py-2 text-center">{row.septiembre}</td>
                  <td className="px-3 py-2 text-center">{row.octubre}</td>
                  <td className="px-3 py-2 text-center">{row.noviembre}</td>
                  <td className="px-3 py-2 text-center">{row.diciembre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderTablaTecnicos = () => {
    if (!data || data.tecnicos.length === 0) {
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
              {data.tecnicos.map((tec) => (
                <tr key={tec.operario} className="align-top hover:bg-gray-50">
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
                              <td className="text-right">{ot}</td>
                            </tr>
                            <tr>
                              <th className="pr-1 font-semibold text-gray-700">
                                REP
                              </th>
                              <td className="text-right">
                                {rep.toLocaleString("es-CO")}
                              </td>
                            </tr>
                            <tr>
                              <th className="pr-1 font-semibold text-gray-700">
                                MO
                              </th>
                              <td className="text-right">
                                {mo.toLocaleString("es-CO")}
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
          <p className="text-sm text-gray-500">Cargando información...</p>
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
                data.mantenimientoPreventivo,
              )}
            {seccion === "cargoCli" &&
              renderTablaSedes(
                "Cantidad OT cargo a cliente",
                data.cargoCliente,
              )}
            {seccion === "tecnicos" && renderTablaTecnicos()}
          </div>
        )}
      </div>
    </div>
  );
}

