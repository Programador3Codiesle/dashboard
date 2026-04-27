'use client';

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  tiempoEntrevistaConsultivaService,
  TiempoEntrevistaConsultivaDetalleRow,
  TiempoEntrevistaConsultivaResumenRow,
} from "@/modules/informes/postventa/services/tiempo-entrevista-consultiva.service";
import {
  formatCantidadCo,
  formatNumeroCo,
} from "@/modules/informes/postventa/format-cantidad-co";
import { useToast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/shared/ui/Pagination";

function getDefaultStartDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

function getDefaultEndDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export default function TiempoEntrevistaConsultivaPage() {
  const { showError, showInfo } = useToast();
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate);
  const [endDate, setEndDate] = useState<string>(getDefaultEndDate);
  const [startDateApplied, setStartDateApplied] =
    useState<string>(getDefaultStartDate);
  const [endDateApplied, setEndDateApplied] = useState<string>(getDefaultEndDate);
  const [bodegaDetalle, setBodegaDetalle] = useState<number | null>(null);
  const [currentPageDetalle, setCurrentPageDetalle] = useState(1);
  const PAGE_SIZE_DETALLE = 10;

  const filtrosAplicados = useMemo(
    () => ({
      startDate: startDateApplied,
      endDate: endDateApplied,
    }),
    [startDateApplied, endDateApplied],
  );

  const {
    data: resumen,
    isLoading: loadingResumen,
    isError: errorResumen,
    refetch: refetchResumen,
  } = useQuery<TiempoEntrevistaConsultivaResumenRow[], Error>({
    queryKey: [
      "informes",
      "postventa",
      "tiempo-entrevista-consultiva",
      filtrosAplicados,
    ],
    queryFn: () =>
      tiempoEntrevistaConsultivaService.obtenerResumen(filtrosAplicados),
    enabled: !!filtrosAplicados.startDate && !!filtrosAplicados.endDate,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    data: detalle,
    isLoading: loadingDetalle,
    isError: errorDetalle,
    refetch: refetchDetalle,
  } = useQuery<TiempoEntrevistaConsultivaDetalleRow[], Error>({
    queryKey: [
      "informes",
      "postventa",
      "tiempo-entrevista-consultiva-detalle",
      filtrosAplicados,
      bodegaDetalle,
    ],
    queryFn: () =>
      tiempoEntrevistaConsultivaService.obtenerDetalle(
        bodegaDetalle as number,
        filtrosAplicados,
      ),
    enabled:
      !!bodegaDetalle &&
      !!filtrosAplicados.startDate &&
      !!filtrosAplicados.endDate,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const onGenerar = () => {
    if (!startDate || !endDate) {
      showError("Debes seleccionar fecha inicial y final.");
      return;
    }
    setStartDateApplied(startDate);
    setEndDateApplied(endDate);
  };

  const verDetalleBodega = (bodega: number) => {
    setBodegaDetalle(bodega);
    setCurrentPageDetalle(1);
    refetchDetalle();
  };

  useEffect(() => {
    if (errorResumen || errorDetalle) {
      showInfo(
        "No hay resumen por bodegas",
      );
    }
  }, [errorResumen, errorDetalle, showInfo]);

  const detalleRows = detalle ?? [];
  const totalItemsDetalle = detalleRows.length;
  const totalPagesDetalle = Math.max(
    1,
    Math.ceil(totalItemsDetalle / PAGE_SIZE_DETALLE),
  );
  const paginatedDetalle = useMemo(() => {
    const start = (currentPageDetalle - 1) * PAGE_SIZE_DETALLE;
    return detalleRows.slice(start, start + PAGE_SIZE_DETALLE);
  }, [detalleRows, currentPageDetalle]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Tiempos Entrevistas Consultivas
        </h1>
        <p className="text-gray-500 mt-1">
          Analiza los registros de citas, cumplimiento y tiempos de entrevistas consultivas por bodega.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha inicial
            </label>
            <input
              type="date"
              className="form-input rounded-lg border border-gray-300 px-3 py-2 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Fecha final
            </label>
            <input
              type="date"
              className="form-input rounded-lg border border-gray-300 px-3 py-2 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary) text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onGenerar}
              className="inline-flex-1 w-full justify-center rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
            >
              Generar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold brand-text">
            Resumen por bodega
          </h2>
          {loadingResumen && (
            <p className="text-sm text-gray-500">Cargando resumen...</p>
          )}
          {!loadingResumen && (!resumen || resumen.length === 0) && (
            <p className="text-sm text-gray-500">
              No hay información para el rango de fechas seleccionado.
            </p>
          )}
          {!loadingResumen && resumen && resumen.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-center font-semibold">
                      Bodega
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      Registro citas
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      Citas marcadas
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      Citas no marcadas
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      Citas cumplidas
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      Citas no cumplidas
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      No asistieron
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      OT abiertas
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      Tiempo entrevistas
                    </th>
                    <th className="px-3 py-2 text-center font-semibold">
                      Opción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resumen.map((row) => (
                    <tr key={row.bodega}>
                      <td className="px-3 py-1.5 text-center">
                        {row.bodega}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {formatCantidadCo(row.registrosCitas)}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {formatCantidadCo(row.citasMarcadas)}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {formatCantidadCo(row.citasNoMarcadas)}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {formatCantidadCo(row.citasCumplidas)}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {formatCantidadCo(row.citasNoCumplidas)}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {formatCantidadCo(row.noAsistieron)}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {formatCantidadCo(row.otAbiertas)}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {row.tiempoEntrevistaConsultiva !== null
                          ? formatNumeroCo(
                              row.tiempoEntrevistaConsultiva,
                              2,
                              2,
                            )
                          : "-"}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-md bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                          onClick={() => verDetalleBodega(row.bodega)}
                        >
                          Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold brand-text">
            Detalle por cita {bodegaDetalle !== null && `(bodega ${bodegaDetalle})`}
          </h2>
          {bodegaDetalle === null && (
            <p className="text-sm text-gray-500">
              Selecciona una bodega en el resumen y luego presiona Generar para ver el detalle.
            </p>
          )}
          {bodegaDetalle !== null && loadingDetalle && (
            <p className="text-sm text-gray-500">Cargando detalle...</p>
          )}
          {bodegaDetalle !== null &&
            !loadingDetalle &&
            (!detalle || detalle.length === 0) && (
              <p className="text-sm text-gray-500">
                No hay detalle para la bodega seleccionada en el rango de fechas.
              </p>
            )}
          {bodegaDetalle !== null &&
            !loadingDetalle &&
            detalle &&
            detalle.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-center font-semibold">
                        ID Cita
                      </th>
                      <th className="px-3 py-2 text-center font-semibold">
                        Placa
                      </th>
                      <th className="px-3 py-2 text-center font-semibold">
                        Fecha cita
                      </th>
                      <th className="px-3 py-2 text-center font-semibold">
                        Bodega
                      </th>
                      <th className="px-3 py-2 text-center font-semibold">
                        Hora llegada
                      </th>
                      <th className="px-3 py-2 text-center font-semibold">
                        N° orden
                      </th>
                      <th className="px-3 py-2 text-center font-semibold">
                        Hora orden
                      </th>
                      <th className="px-3 py-2 text-center font-semibold">
                        Tiempo orden (min)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedDetalle.map((row) => (
                      <tr key={row.idCita}>
                        <td className="px-3 py-1.5 text-center">
                          {row.idCita}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {row.placa}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {row.fechaCita
                            ? new Date(row.fechaCita).toLocaleString("es-CO")
                            : ""}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {row.bodega}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {row.horaLlegada
                            ? new Date(row.horaLlegada).toLocaleString("es-CO")
                            : ""}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {row.numeroOrdenTaller ?? ""}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {row.horaOrden
                            ? new Date(row.horaOrden).toLocaleString("es-CO")
                            : ""}
                        </td>
                        <td className="px-3 py-1.5 text-center">
                          {row.tiempoOrden !== null ? row.tiempoOrden : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          {bodegaDetalle !== null &&
            !loadingDetalle &&
            totalItemsDetalle > 0 && (
              <div className="p-4 border-t border-gray-200 flex justify-center">
                <Pagination
                  currentPage={currentPageDetalle}
                  totalPages={totalPagesDetalle}
                  onChange={setCurrentPageDetalle}
                />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

