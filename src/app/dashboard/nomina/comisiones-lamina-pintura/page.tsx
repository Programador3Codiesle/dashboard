'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye, FileSpreadsheet, Search, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import {
  ComisionLaminaPintura,
  DetalleComisionLaminaPintura,
  comisionesLaminaPinturaService,
} from '@/modules/nomina/services/comisiones-lamina-pintura.service';

function formatCurrency(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString('es-CO');
}

function formatPercent(value: number): string {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

function getPercentBadgeClass(value: number): string {
  const safe = Number(value ?? 0);
  if (safe >= 85) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (safe >= 70) return 'bg-sky-100 text-sky-800 border-sky-200';
  if (safe >= 50) return 'bg-amber-100 text-amber-800 border-amber-200';
  return 'bg-rose-100 text-rose-800 border-rose-200';
}

export default function ComisionesLaminaPinturaPage() {
  const { showError } = useToast();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [rows, setRows] = useState<ComisionLaminaPintura[]>([]);
  const [totalGiron, setTotalGiron] = useState(0);
  const [totalBocono, setTotalBocono] = useState(0);
  const [detalleRows, setDetalleRows] = useState<DetalleComisionLaminaPintura[]>([]);
  const [detalleTitulo, setDetalleTitulo] = useState('');
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);

  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const listarMutation = useMutation({
    mutationFn: async (params: { desde: string; hasta: string }) => {
      const [lista, repGiron, repBocono] = await Promise.all([
        comisionesLaminaPinturaService.listar(params.desde, params.hasta),
        comisionesLaminaPinturaService.totalRepuestosSede({
          desde: params.desde,
          hasta: params.hasta,
          sede: 1,
        }),
        comisionesLaminaPinturaService.totalRepuestosSede({
          desde: params.desde,
          hasta: params.hasta,
          sede: 2,
        }),
      ]);
      return { lista, repGiron, repBocono };
    },
    onSuccess: (data) => {
      setRows(data.lista);
      setTotalGiron(data.repGiron.total);
      setTotalBocono(data.repBocono.total);
    },
    onError: (error: any) => {
      showError(
        error?.response?.data?.message ||
          'No se pudo cargar la nómina de lámina y pintura.',
      );
    },
  });

  const detalleMutation = useMutation({
    mutationFn: (params: { desde: string; hasta: string; nit: string }) =>
      comisionesLaminaPinturaService.detalle(params),
    onSuccess: (data) => {
      setDetalleRows(data);
      setIsDetalleOpen(true);
    },
    onError: () => showError('No se pudo cargar el detalle del operario.'),
  });

  const onBuscar = () => {
    if (!desde || !hasta) {
      showError('Debes seleccionar un rango de fechas.');
      return;
    }
    if (new Date(desde) > new Date(hasta)) {
      showError('La fecha inicial no puede ser mayor a la fecha final.');
      return;
    }
    listarMutation.mutate({ desde, hasta });
  };

  const onAbrirDetalle = (row: ComisionLaminaPintura) => {
    if (!desde || !hasta) {
      showError('Selecciona el rango de fechas antes de ver el detalle.');
      return;
    }
    setDetalleTitulo(`Detalle de nómina empleado ${row.operario}`);
    detalleMutation.mutate({ desde, hasta, nit: row.operario });
  };

  const onExportExcel = () => {
    if (rows.length === 0) {
      showError('No hay información para exportar.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Cedula: r.operario,
        Operario: r.nombres,
        Cargo: r.descripcion,
        Productividad: Number(r.productividad.toFixed(2)),
        'Horas Trabajadas': r.horasTrabajadas,
        'Horas Productivas Mes': r.horasProductivasMes,
        'Porcentaje Liquidacion': Number(r.porcentajeLiquidacion.toFixed(2)),
        Materiales: r.materiales,
        'Base Comision MO': r.baseComisionMo,
        Internas: r.internas,
        'Comision sin Internas': r.comisionSinInternasMo,
        'Base Repuestos': r.baseRepuestos,
        'Comision Repuestos': r.comisionRepuestos,
        '% Fac Total': Number(r.porcFacTotal.toFixed(2)),
        'Pulidas Livianos': r.pulidasLivianos,
        'Total Pulido Livianos': r.totalPulidoLivianos,
        'Pulidas Pesados': r.pulidasPesados,
        'Total Pulido Pesados': r.totalPulidoPesados,
        Vidrios: r.vidrios,
        'Bono NPS': r.bonoNps,
        'Comision a Pagar': r.totalPagar,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nomina LYP');
    XLSX.writeFile(wb, `nomina-lamina-pintura-${desde}-a-${hasta}.xlsx`);
  };

  const onExportDetalle = () => {
    if (detalleRows.length === 0) {
      showError('No hay detalle para exportar.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(detalleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Detalle LYP');
    XLSX.writeFile(wb, `detalle-nomina-lamina-pintura-${desde}-a-${hasta}.xlsx`);
  };

  const resumenFechas = useMemo(() => {
    if (!desde || !hasta) return 'sin rango seleccionado';
    return `${desde} a ${hasta}`;
  }, [desde, hasta]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Comisiones lámina y pintura
        </h1>
        <p className="text-gray-500 mt-1">
          Reporte consolidado de productividad, materiales, repuestos y comisión a
          pagar.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Fecha inicial</label>
            <input
              type="date"
              className={inputClass}
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Fecha final</label>
            <input
              type="date"
              className={inputClass}
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={onBuscar}
            disabled={listarMutation.isPending}
            className="inline-flex items-center justify-center rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Search size={16} className="mr-2" />
            {listarMutation.isPending ? 'Generando...' : 'Generar nómina'}
          </button>
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Exportar Excel
          </button>
        </div>
        <p className="text-xs text-gray-500">
          {rows.length} registros para {resumenFechas}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Venta de Repuestos Girón</p>
          <p className="text-2xl font-bold brand-text mt-1">
            ${formatCurrency(totalGiron)}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Venta de Repuestos Boconó</p>
          <p className="text-2xl font-bold brand-text mt-1">
            ${formatCurrency(totalBocono)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {listarMutation.isPending && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}

        {!listarMutation.isPending && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              No hay datos para el rango seleccionado.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ajusta las fechas o valida que exista información en base de datos.
            </p>
          </div>
        )}

        {!listarMutation.isPending && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold">Cédula</th>
                  <th className="px-3 py-2 text-center font-semibold">Operario</th>
                  <th className="px-3 py-2 text-center font-semibold">Cargo</th>
                  <th className="px-3 py-2 text-center font-semibold">Productividad</th>
                  <th className="px-3 py-2 text-center font-semibold">Horas Trabajadas</th>
                  <th className="px-3 py-2 text-center font-semibold">Horas Mes</th>
                  <th className="px-3 py-2 text-center font-semibold">% Liquidación</th>
                  <th className="px-3 py-2 text-center font-semibold">Materiales</th>
                  <th className="px-3 py-2 text-center font-semibold">Base MO</th>
                  <th className="px-3 py-2 text-center font-semibold">Internas</th>
                  <th className="px-3 py-2 text-center font-semibold">Comisión MO</th>
                  <th className="px-3 py-2 text-center font-semibold">Base Rptos</th>
                  <th className="px-3 py-2 text-center font-semibold">Comisión Rptos</th>
                  <th className="px-3 py-2 text-center font-semibold">Pulidas Livianos</th>
                  <th className="px-3 py-2 text-center font-semibold">Pulidas Pesados</th>
                  <th className="px-3 py-2 text-center font-semibold">Vidrios</th>
                  <th className="px-3 py-2 text-center font-semibold">Bono NPS</th>
                  <th className="px-3 py-2 text-center font-semibold">Comisión a Pagar</th>
                  <th className="px-3 py-2 text-center font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.operario}>
                    <td className="px-3 py-1.5 text-center">{row.operario}</td>
                    <td className="px-3 py-1.5">{row.nombres}</td>
                    <td className="px-3 py-1.5 text-center">{row.descripcion}</td>
                    <td className="px-3 py-1.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getPercentBadgeClass(row.productividad)}`}
                      >
                        {formatPercent(row.productividad)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-center">{row.horasTrabajadas}</td>
                    <td className="px-3 py-1.5 text-center">{row.horasProductivasMes}</td>
                    <td className="px-3 py-1.5 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getPercentBadgeClass(row.porcentajeLiquidacion)}`}
                      >
                        {formatPercent(row.porcentajeLiquidacion)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.materiales)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.baseComisionMo)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.internas)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.comisionSinInternasMo)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.baseRepuestos)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.comisionRepuestos)}</td>
                    <td className="px-3 py-1.5 text-center">{row.pulidasLivianos}</td>
                    <td className="px-3 py-1.5 text-center">{row.pulidasPesados}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.vidrios)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.bonoNps)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold">{formatCurrency(row.totalPagar)}</td>
                    <td className="px-3 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onAbrirDetalle(row)}
                        className="inline-flex items-center rounded-lg bg-sky-600 px-2 py-1 text-white hover:bg-sky-700 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDetalleOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={() => setIsDetalleOpen(false)}
          />
          <div className="relative z-10 w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-slate-50 to-white">
              <div>
                <h2 className="text-xl font-bold brand-text tracking-tight">
                  {detalleTitulo}
                </h2>
                <p className="text-sm text-gray-500">
                  Detalle de facturación y comisión del operario en el período.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onExportDetalle}
                  className="inline-flex items-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  <FileSpreadsheet size={14} className="mr-1.5" />
                  Exportar detalle
                </button>
                <button
                  type="button"
                  onClick={() => setIsDetalleOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {detalleMutation.isPending && (
                <p className="text-sm text-gray-500">Cargando detalle...</p>
              )}
              {!detalleMutation.isPending && detalleRows.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Sin detalle disponible
                  </p>
                </div>
              )}

              {!detalleMutation.isPending && detalleRows.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-center font-semibold">Factura</th>
                        <th className="px-3 py-2 text-center font-semibold">N. Orden</th>
                        <th className="px-3 py-2 text-center font-semibold">Placa</th>
                        <th className="px-3 py-2 text-center font-semibold">Vehículo</th>
                        <th className="px-3 py-2 text-center font-semibold">Productividad</th>
                        <th className="px-3 py-2 text-center font-semibold">% Liquidación</th>
                        <th className="px-3 py-2 text-center font-semibold">Tiempo Facturado</th>
                        <th className="px-3 py-2 text-center font-semibold">Base Comisión</th>
                        <th className="px-3 py-2 text-center font-semibold">Materiales</th>
                        <th className="px-3 py-2 text-center font-semibold">Internas</th>
                        <th className="px-3 py-2 text-center font-semibold">Comisión a Pagar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detalleRows.map((row, idx) => (
                        <tr key={`${row.factura}-${row.numeroOrden}-${idx}`}>
                          <td className="px-3 py-1.5 text-center">{row.factura}</td>
                          <td className="px-3 py-1.5 text-center">{row.numeroOrden}</td>
                          <td className="px-3 py-1.5 text-center">{row.placa}</td>
                          <td className="px-3 py-1.5 text-center">{row.vehiculo}</td>
                          <td className="px-3 py-1.5 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getPercentBadgeClass(row.productividad)}`}
                            >
                              {formatPercent(row.productividad)}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getPercentBadgeClass(row.porcentajeLiquidacion)}`}
                            >
                              {formatPercent(row.porcentajeLiquidacion)}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-center">{row.tiempoFacturado}</td>
                          <td className="px-3 py-1.5 text-right">{formatCurrency(row.baseComision)}</td>
                          <td className="px-3 py-1.5 text-right">{formatCurrency(row.materiales)}</td>
                          <td className="px-3 py-1.5 text-right">{formatCurrency(row.internas)}</td>
                          <td className="px-3 py-1.5 text-right font-semibold">{formatCurrency(row.comisionPagar)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
