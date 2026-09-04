'use client';

import { COMISIONES_TECNICOS_SUBMENU_ID } from '@/utils/constants';
import { useNominaPageGuard } from '@/modules/nomina/shared/hooks/useNominaPageGuard';
import { formatCurrency, getApiErrorMessage } from '@/modules/nomina/utils/format-currency';
import { NOMINA_STYLES } from '@/modules/nomina/constants';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye, FileSpreadsheet, Search, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { EmpresaBadge } from '@/components/shared/brand/EmpresaBadge';
import {
  ComisionTecnico,
  DetalleComisionTecnico,
  comisionesTecnicosService,
} from '@/modules/nomina/services/comisiones-tecnicos.service';

export function ComisionesTecnicosGestion() {
  const { blocked } = useNominaPageGuard(COMISIONES_TECNICOS_SUBMENU_ID);

  const { showError } = useToast();
  const detallePageSize = 5;
  const [mes, setMes] = useState('');
  const [rows, setRows] = useState<ComisionTecnico[]>([]);
  const [detalleRows, setDetalleRows] = useState<DetalleComisionTecnico[]>([]);
  const [detallePage, setDetallePage] = useState(1);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [detalleTitulo, setDetalleTitulo] = useState('');
  const listarMutation = useMutation({
    mutationFn: (month: string) => comisionesTecnicosService.listar(month),
    onSuccess: setRows,
    onError: (error: unknown) => {
      showError(
        getApiErrorMessage(error, 'No se pudo cargar la nómina de técnicos.'),
      );
    },
  });

  const detalleMutation = useMutation({
    mutationFn: (params: { mes: number; anio: number; nit: string }) =>
      comisionesTecnicosService.detalle(params),
    onSuccess: (data) => {
      setDetalleRows(data);
      setDetallePage(1);
    },
    onError: () => showError('No se pudo cargar el detalle del técnico.'),
  });

  const onBuscar = () => {
    if (!mes) {
      showError('Debes escoger un mes y año.');
      return;
    }
    const monthDate = `${mes}-01`;
    if (monthDate < '2022-04-01') {
      showError('No se puede cargar esta fecha.');
      return;
    }
    listarMutation.mutate(mes);
  };

  const onAbrirDetalle = (row: ComisionTecnico) => {
    if (!mes) {
      showError('Primero selecciona un mes válido.');
      return;
    }
    const [anio, month] = mes.split('-');
    setDetalleTitulo(`Detalle de nómina empleado ${row.nit}`);
    setDetalleRows([]);
    setDetallePage(1);
    setIsDetalleOpen(true);
    detalleMutation.mutate({
      mes: Number(month),
      anio: Number(anio),
      nit: row.nit,
    });
  };

  const onExportExcel = async () => {
    if (rows.length === 0) {
      showError('No hay información para exportar.');
      return;
    }
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Cedula: r.nit,
        Tecnico: r.tecnico,
        Patio: r.patio,
        Cargo: r.cargo,
        'Venta Repuestos': r.ventaRepuestos,
        'Venta Mano de Obra': r.ventaManoObra,
        'Comision Repuestos': r.comisionRepuestos,
        'Comision Mano de Obra': r.comisionManoObra,
        'Segunda Entrega': r.segundaEntrega,
        'Bono NPS': r.bonoNps,
        'Instalacion Accesorios': r.instalacionAccesorios,
        Internas: r.internas,
        Alineacion: r.alineaciones,
        Balanceo: r.balanceos,
        Total: r.total,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ComisionesTecnicos');
    XLSX.writeFile(wb, `nomina-tecnicos-${mes || 'sin-mes'}.xlsx`);
  };

  const onExportDetalle = async () => {
    if (detalleRows.length === 0) {
      showError('No hay detalle para exportar.');
      return;
    }
    const XLSX = await import('xlsx');
    const ws = XLSX.utils.json_to_sheet(detalleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DetalleTecnicos');
    XLSX.writeFile(wb, `detalle-nomina-tecnicos-${mes || 'sin-mes'}.xlsx`);
  };

  const resumenMes = useMemo(() => (mes ? mes : 'sin mes seleccionado'), [mes]);
  const totalDetallePages = Math.max(
    1,
    Math.ceil(detalleRows.length / detallePageSize),
  );
  const detalleRowsPaginadas = useMemo(() => {
    const start = (detallePage - 1) * detallePageSize;
    return detalleRows.slice(start, start + detallePageSize);
  }, [detalleRows, detallePage]);

  const closeDetalleModal = () => {
    setIsDetalleOpen(false);
    setDetallePage(1);
  };

  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <h1 className="app-title-xl brand-text">
            Comisiones técnicos
          </h1>
          <EmpresaBadge />
        </div>
        <p className="text-gray-500 mt-1">
          Consulta de comisión de técnicos con detalle por factura y operación.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-6 shadow-lg space-y-4">
        <div className="app-filter-grid">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Mes</label>
            <input
              type="month"
              className={NOMINA_STYLES.input}
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={onBuscar}
            disabled={listarMutation.isPending}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white hover:bg-(--color-primary-dark) transition-colors disabled:opacity-60"
          >
            <Search size={16} className="mr-2" />
            {listarMutation.isPending ? 'Generando...' : 'Generar nómina'}
          </button>
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Exportar Excel
          </button>
        </div>
        <p className="text-xs text-gray-500">
          {rows.length} registros para {resumenMes}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {listarMutation.isPending && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}

        {!listarMutation.isPending && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              No hay datos para el período seleccionado.
            </p>
          </div>
        )}

        {!listarMutation.isPending && rows.length > 0 && (
          <div className="app-table-scroll">
            <table className="w-full min-w-[1600px] divide-y divide-gray-200 text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold">Cédula</th>
                  <th className="px-3 py-2 text-center font-semibold">Técnico</th>
                  <th className="px-3 py-2 text-center font-semibold">Patio</th>
                  <th className="px-3 py-2 text-center font-semibold">Cargo</th>
                  <th className="px-3 py-2 text-center font-semibold">Venta Rptos</th>
                  <th className="px-3 py-2 text-center font-semibold">Venta MO</th>
                  <th className="px-3 py-2 text-center font-semibold">Comisión Rptos</th>
                  <th className="px-3 py-2 text-center font-semibold">Comisión MO</th>
                  <th className="px-3 py-2 text-center font-semibold">2da Entrega</th>
                  <th className="px-3 py-2 text-center font-semibold">Bono NPS</th>
                  <th className="px-3 py-2 text-center font-semibold">Instalación</th>
                  <th className="px-3 py-2 text-center font-semibold">Internas</th>
                  <th className="px-3 py-2 text-center font-semibold">Alineación</th>
                  <th className="px-3 py-2 text-center font-semibold">Balanceo</th>
                  <th className="px-3 py-2 text-center font-semibold">Total</th>
                  <th className="px-3 py-2 text-center font-semibold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.nit}>
                    <td className="px-3 py-1.5 text-center">{row.nit}</td>
                    <td className="px-3 py-1.5">{row.tecnico}</td>
                    <td className="px-3 py-1.5 text-center">{row.patio}</td>
                    <td className="px-3 py-1.5 text-center">{row.cargo}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.ventaRepuestos)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.ventaManoObra)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.comisionRepuestos)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.comisionManoObra)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.segundaEntrega)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.bonoNps)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.instalacionAccesorios)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.internas)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.alineaciones)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.balanceos)}</td>
                    <td className="px-3 py-1.5 text-right font-semibold">{formatCurrency(row.total)}</td>
                    <td className="px-3 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onAbrirDetalle(row)}
                        className={NOMINA_STYLES.detailBtn}
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-gray-200 bg-linear-to-r from-slate-50 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight brand-text sm:text-xl">
                  {detalleTitulo}
                </h2>
                <p className="text-sm text-gray-500">
                  Detalle de movimientos por técnico para el período consultado.
                </p>
              </div>
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={onExportDetalle}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  <FileSpreadsheet size={14} className="mr-1.5" />
                  Exportar detalle
                </button>
                <button
                  type="button"
                  onClick={closeDetalleModal}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
              {detalleMutation.isPending && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-(--color-primary)" />
                    <p className="text-sm font-medium text-gray-600">
                      Cargando detalle del técnico...
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
                    <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
                  </div>
                </div>
              )}
              {!detalleMutation.isPending && detalleRows.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    Sin detalle disponible
                  </p>
                </div>
              )}
              {!detalleMutation.isPending && detalleRows.length > 0 && (
                <div className="app-table-scroll">
                  <table className="w-full min-w-[1200px] divide-y divide-gray-200 text-xs md:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-center font-semibold">Factura</th>
                        <th className="px-3 py-2 text-center font-semibold">N. Orden</th>
                        <th className="px-3 py-2 text-center font-semibold">Placa</th>
                        <th className="px-3 py-2 text-center font-semibold">Vehículo</th>
                        <th className="px-3 py-2 text-center font-semibold">Operación</th>
                        <th className="px-3 py-2 text-center font-semibold">Nombre operación</th>
                        <th className="px-3 py-2 text-center font-semibold">Venta Rptos</th>
                        <th className="px-3 py-2 text-center font-semibold">Venta MO</th>
                        <th className="px-3 py-2 text-center font-semibold">2da Entrega</th>
                        <th className="px-3 py-2 text-center font-semibold">Instalación</th>
                        <th className="px-3 py-2 text-center font-semibold">Internas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detalleRowsPaginadas.map((row, idx) => (
                        <tr key={`${row.factura}-${idx}`}>
                          <td className="px-3 py-1.5 text-center">{row.factura}</td>
                          <td className="px-3 py-1.5 text-center">{row.numeroOrden}</td>
                          <td className="px-3 py-1.5 text-center">{row.placa}</td>
                          <td className="px-3 py-1.5 text-center">{row.vehiculo}</td>
                          <td className="px-3 py-1.5 text-center">{row.operacion}</td>
                          <td className="px-3 py-1.5 text-center">{row.nombreOperacion}</td>
                          <td className="px-3 py-1.5 text-right">{formatCurrency(row.ventaRepuestos)}</td>
                          <td className="px-3 py-1.5 text-right">{formatCurrency(row.ventaManoObra)}</td>
                          <td className="px-3 py-1.5 text-right">{formatCurrency(row.segundaEntrega)}</td>
                          <td className="px-3 py-1.5 text-right">{formatCurrency(row.instalacionAccesorios)}</td>
                          <td className="px-3 py-1.5 text-right">{formatCurrency(row.internas)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!detalleMutation.isPending && detalleRows.length > detallePageSize && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Página {detallePage} de {totalDetallePages}
                  </p>
                  <div className="flex w-full gap-2 sm:w-auto">
                    <button
                      type="button"
                      disabled={detallePage === 1}
                      onClick={() => setDetallePage((prev) => Math.max(1, prev - 1))}
                      className="flex-1 sm:flex-none rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      disabled={detallePage === totalDetallePages}
                      onClick={() =>
                        setDetallePage((prev) => Math.min(totalDetallePages, prev + 1))
                      }
                      className="flex-1 sm:flex-none rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
