'use client';

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { AusentismoInforme, informeAusentismoService } from "@/modules/administracion/services/informe-ausentismo.service";
import { Pagination } from "@/components/shared/ui/Pagination";
import { InformesPageFrame } from "@/modules/informes/components/InformesPageFrame";
import { INFORMES_COPY, INFORMES_GH_TRIMENU } from "@/modules/informes/constants";
import { InformesQueryError } from "@/modules/informes/shared/components/InformesQueryError";
import { informesKeys } from "@/modules/informes/shared/constants/query-keys";
import { useInformesPageGuard } from "@/modules/informes/shared/hooks/useInformesPageGuard";
import { getErrorMessage } from "@/modules/informes/shared/utils/parse-api-error";

const PAGE_SIZE = 10;
const EMPLEADO_DEBOUNCE_MS = 350;

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthRange(value: string): { desde: string; hasta: string } | null {
  if (!value) return null;
  const [year, month] = value.split("-");
  if (!year || !month) return null;
  const firstDay = `${year}-${month}-01`;

  const now = new Date();
  const selectedYear = Number(year);
  const selectedMonth = Number(month);
  const isCurrentMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;

  if (isCurrentMonth) {
    return { desde: firstDay, hasta: formatLocalDate(now) };
  }

  const lastDate = new Date(Number(year), Number(month), 0).getDate();
  const lastDay = `${year}-${month}-${String(lastDate).padStart(2, "0")}`;
  return { desde: firstDay, hasta: lastDay };
}

export function InfAusentismosGestion() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_GH_TRIMENU.infAusentismos,
    redirectTo: "/dashboard/informes/gestion-humana",
  });
  const [month, setMonth] = useState("");
  const [empleado, setEmpleado] = useState("");
  const [debouncedEmpleado, setDebouncedEmpleado] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const isEmpleadoDebouncing = empleado.trim() !== debouncedEmpleado;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedEmpleado(empleado.trim());
    }, EMPLEADO_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [empleado]);

  const range = useMemo(() => getMonthRange(month), [month]);
  const { data: queryData, isFetching: loading, isError, error } = useQuery<{
    items: AusentismoInforme[];
    total: number;
  }>({
    queryKey: informesKeys.gh.infAusentismos(
      `${month}|${debouncedEmpleado}|${currentPage}`,
    ),
    queryFn: () =>
      informeAusentismoService.listar({
        fechaDesde: range!.desde,
        fechaHasta: range!.hasta,
        empleado: debouncedEmpleado || undefined,
        pagina: currentPage,
        limite: PAGE_SIZE,
        soloPendientes: true,
      }),
    enabled: !!range && !isEmpleadoDebouncing,
    retry: false,
    staleTime: 60 * 1000,
  });

  const hasMonth = !!month;

  const data = useMemo(() => queryData?.items ?? [], [queryData?.items]);
  const totalItems = queryData?.total ?? 0;
  const showInitialLoader = loading && data.length === 0;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
    [totalItems],
  );

  const handleMonthChange = (value: string) => {
    setMonth(value);
    setCurrentPage(1);
  };

  const handleEmpleadoChange = (value: string) => {
    setEmpleado(value);
    setCurrentPage(1);
  };

  if (blocked) return null;

  return (
    <InformesPageFrame
      title={INFORMES_COPY.infAusentismos.title}
      description={INFORMES_COPY.infAusentismos.description}
      backHref="/dashboard/informes/gestion-humana"
      backLabel={INFORMES_COPY.backGh}
    >
      {isError ? (
        <InformesQueryError
          message={getErrorMessage(error, INFORMES_COPY.infAusentismos.loadError)}
        />
      ) : null}
      <div className="app-filter-grid">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Mes</label>
            <input
              type="month"
              max={new Date().toISOString().slice(0, 7)}
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 mb-1">Empleado (documento o nombre)</label>
            <input
              type="text"
              value={empleado}
              onChange={(e) => handleEmpleadoChange(e.target.value)}
              placeholder="Opcional: filtrar por empleado"
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none"
            />
          </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-(--color-primary)" />
            <h2 className="text-base font-semibold text-gray-900">Resultados</h2>
          </div>
          {hasMonth && (
            <span className="text-xs text-gray-500">
              {totalItems} registro{totalItems === 1 ? "" : "s"}
            </span>
          )}
          {hasMonth && loading && !showInitialLoader && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="animate-spin" size={14} />
              Actualizando...
            </div>
          )}
        </div>

        <div className="app-table-scroll">
          <table className="w-full min-w-[900px]">
            <thead className="brand-bg border-b border-(--color-primary-dark)] text-sm">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Documento</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Motivo</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Fecha Inicial</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Fecha Final</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Hora Inicial</th>
                <th className="text-left py-3 px-4 font-semibold text-white whitespace-nowrap">Hora Final</th>
              </tr>
            </thead>
            <tbody>
              {!hasMonth ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    Seleccione un mes para ver el informe.
                  </td>
                </tr>
              ) : showInitialLoader ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando ausentismos...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No se encontraron datos para el mes seleccionado.
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    // El backend puede devolver registros repetidos; al incluir `index` garantizamos unicidad entre hijos.
                    key={`${row.id}-${row.documento}-${row.fechaInicio}-${row.horaInicio}-${row.fechaFin}-${row.horaFin}-${index}`}
                    className="border-b border-gray-100 hover:bg-gray-50/60 text-sm"
                  >
                    <td className="px-4 py-2 whitespace-nowrap">{row.documento}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.colaborador}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.motivo || "—"}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.fechaInicio}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.fechaFin}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.horaInicio}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{row.horaFin}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasMonth && totalItems > 0 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </motion.div>
    </InformesPageFrame>
  );
}

