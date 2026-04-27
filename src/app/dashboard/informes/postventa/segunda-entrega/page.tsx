'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { segundaEntregaService, SegundaEntregaDetalle, SegundaEntregaResumen } from '@/modules/informes/postventa/services/segunda-entrega.service';
import { formatCantidadCo } from '@/modules/informes/postventa/format-cantidad-co';
import { useToast } from '@/components/shared/ui/ToastContext';

interface DataState {
  resumen: SegundaEntregaResumen[];
  detalle: SegundaEntregaDetalle[];
}

function formatearFechaMostrar(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const tablaShell =
  "bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden";
const tablaScroll = "max-h-[min(70vh,480px)] overflow-auto";
const thBase =
  "px-3 py-2.5 text-center text-xs font-semibold text-white whitespace-nowrap border-b border-white/15";
const tdBase =
  "px-3 py-2 text-center text-sm text-gray-800 align-middle border-b border-gray-100";

const inputDateClass =
  "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none";

export default function SegundaEntregaPage() {
  const [fechaIni, setFechaIni] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [data, setData] = useState<DataState | null>(null);
  const [rangoConsultado, setRangoConsultado] = useState<{
    desde: string;
    hasta: string;
  } | null>(null);
  const { showInfo, showError } = useToast();

  const { mutate, isPending } = useMutation<DataState, Error, void>({
    mutationFn: async () => {
      if (!fechaIni || !fechaFin) {
        showInfo('Debes seleccionar fecha inicial y fecha final.');
        throw new Error('fechas-requeridas');
      }

      const fi = fechaIni;
      const ff = fechaFin;

      const resp = await segundaEntregaService.listar(fi, ff);
      if (resp.resumen.length === 0 && resp.detalle.length === 0) {
        showInfo('No hay datos para el rango de fechas seleccionado.');
      }
      setRangoConsultado({ desde: fi, hasta: ff });
      setData(resp);
      return resp;
    },
    onError: (error) => {
      if (error.message !== 'fechas-requeridas') {
        showError('No se pudo cargar el informe de Segunda Entrega.');
      }
    },
  });

  const handleBuscar = () => {
    mutate();
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Informe Segunda Entrega
          </h1>
          <p className="text-gray-500 mt-1">
            Resumen diario y detalle de segundas entregas vs agendas generadas.
          </p>
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha inicial
            </label>
            <input
              type="date"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              className={inputDateClass}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-gray-600 mb-1">
              Fecha final
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={inputDateClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={handleBuscar}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            <span>Buscar</span>
          </button>
        </div>
      </div>

      {/* Resumen — mismos encabezados que legacy (segunda_entrega.php) */}
      <div className={tablaShell}>
        <div className={tablaScroll}>
          <table className="min-w-full border-collapse">
            <thead className="bg-(--color-primary) text-white sticky top-0 z-10 shadow-sm">
              {rangoConsultado && (
                <tr>
                  <th
                    colSpan={5}
                    scope="colgroup"
                    className="px-4 py-3 text-center text-sm font-bold border-b border-white/20"
                  >
                    Informe de Segunda Entrega desde:{" "}
                    {formatearFechaMostrar(rangoConsultado.desde)} hasta:{" "}
                    {formatearFechaMostrar(rangoConsultado.hasta)}
                  </th>
                </tr>
              )}
              <tr>
                <th scope="col" className={thBase}>
                  Año
                </th>
                <th scope="col" className={thBase}>
                  Mes
                </th>
                <th scope="col" className={thBase}>
                  Día
                </th>
                <th scope="col" className={thBase}>
                  Entregas
                </th>
                <th scope="col" className={thBase}>
                  Agendas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isPending ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando resumen...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {data?.resumen.map((row, idx) => (
                    <tr
                      key={`${row.anio}-${row.mes}-${row.dia}-${idx}`}
                      className="odd:bg-gray-50/70 hover:bg-gray-100/90 transition-colors"
                    >
                      <td className={tdBase}>{row.anio}</td>
                      <td className={tdBase}>{row.mes}</td>
                      <td className={tdBase}>{row.dia}</td>
                      <td className={tdBase}>{formatCantidadCo(row.entregas)}</td>
                      <td className={tdBase}>{formatCantidadCo(row.agendas)}</td>
                    </tr>
                  ))}
                  {!data?.resumen?.length && (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm text-gray-500"
                        colSpan={5}
                      >
                        {data
                          ? "Sin datos para mostrar."
                          : "Seleccione fecha inicial, fecha final y pulse Buscar para ver el resumen."}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle — título + columnas como legacy */}
      <div className={tablaShell}>
        <div className={tablaScroll}>
          <table className="min-w-full border-collapse">
            <thead className="bg-(--color-primary) text-white sticky top-0 z-10 shadow-sm">
              {rangoConsultado && (
                <tr>
                  <th
                    colSpan={6}
                    scope="colgroup"
                    className="px-4 py-3 text-center text-sm font-bold border-b border-white/20"
                  >
                    Informe Detallado de Segunda Entrega desde:{" "}
                    {formatearFechaMostrar(rangoConsultado.desde)} hasta:{" "}
                    {formatearFechaMostrar(rangoConsultado.hasta)}
                  </th>
                </tr>
              )}
              <tr>
                <th scope="col" className={thBase}>
                  Año
                </th>
                <th scope="col" className={thBase}>
                  Mes
                </th>
                <th scope="col" className={thBase}>
                  Día
                </th>
                <th scope="col" className={thBase}>
                  Vehiculo
                </th>
                <th scope="col" className={thBase}>
                  Sede
                </th>
                <th scope="col" className={thBase}>
                  Agendado por
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {isPending ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Cargando detalle...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {data?.detalle.map((row, idx) => (
                    <tr
                      key={`${row.anio}-${row.mes}-${row.dia}-${row.vehiculo}-${idx}`}
                      className="odd:bg-gray-50/70 hover:bg-gray-100/90 transition-colors"
                    >
                      <td className={tdBase}>{row.anio}</td>
                      <td className={tdBase}>{row.mes}</td>
                      <td className={tdBase}>{row.dia}</td>
                      <td className={tdBase}>{row.vehiculo}</td>
                      <td className={tdBase}>{row.sede}</td>
                      <td className={tdBase}>{row.agendadoPor}</td>
                    </tr>
                  ))}
                  {!data?.detalle?.length && (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-sm text-gray-500"
                        colSpan={6}
                      >
                        {data
                          ? "Sin datos detallados para mostrar."
                          : "Seleccione fecha inicial, fecha final y pulse Buscar para ver el detalle."}
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

