'use client';

import { COMISIONES_ASESORES_REPUESTOS_SUBMENU_ID } from '@/utils/constants';
import { useNominaPageGuard } from '@/modules/nomina/shared/hooks/useNominaPageGuard';
import { formatCurrency, formatPercent } from '@/modules/nomina/utils/format-currency';
import { NOMINA_STYLES, PERFILES_COMISIONES_ASESORES_FILTRO_SESION } from '@/modules/nomina/constants';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/core/auth/hooks/useAuth';
import {
  ComisionAsesorRepuesto,
  DetalleComisionAsesorRepuesto,
  comisionesAsesoresRepuestosService,
} from '@/modules/nomina/services/comisiones-asesores-repuestos.service';
import { Eye, FileSpreadsheet, Search, RotateCcw, X } from 'lucide-react';
import { EmpresaBadge } from '@/components/shared/brand/EmpresaBadge';

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

function getDefaultYear(): number {
  const current = new Date().getFullYear();
  return YEARS.includes(current) ? current : YEARS[0];
}

function toFileSafeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ComisionesAsesoresRepuestosGestion() {
  const { blocked } = useNominaPageGuard(COMISIONES_ASESORES_REPUESTOS_SUBMENU_ID);

  const { showError } = useToast();
  const { user } = useAuth();

  const [ano, setAno] = useState<number>(getDefaultYear());
  const [mes, setMes] = useState<string>('');
  const [rows, setRows] = useState<ComisionAsesorRepuesto[]>([]);
  const [detalleRows, setDetalleRows] = useState<DetalleComisionAsesorRepuesto[]>(
    [],
  );
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [detalleTitle, setDetalleTitle] = useState('');
  const listarMutation = useMutation({
    mutationFn: (params: {
      mes: number;
      ano: number;
      asesorNombre?: string | null;
    }) => comisionesAsesoresRepuestosService.listar(params),
    onSuccess: (data) => setRows(data),
    onError: () => {
      showError(
        'No se pudo cargar la tabla de comisiones de asesores de repuestos.',
      );
    },
  });

  const detalleMutation = useMutation({
    mutationFn: (params: {
      nom: string;
      sede: string;
      mes: number;
      ano: number;
    }) => comisionesAsesoresRepuestosService.obtenerDetalle(params),
    onSuccess: (data) => {
      setDetalleRows(data);
      setIsDetalleOpen(true);
    },
    onError: () => {
      showError('No se pudo cargar el detalle de comisiones del asesor.');
    },
  });

  const selectedMonthLabel = useMemo(
    () => MONTHS.find((m) => String(m.value) === mes)?.label ?? 'mes',
    [mes],
  );

  const onBuscar = () => {
    const mesNum = Number(mes);
    if (!ano || !mesNum) {
      showError('Debes seleccionar año y mes para consultar.');
      return;
    }

    const now = new Date();
    const anoActual = now.getFullYear();
    const mesActual = now.getMonth() + 1;
    if (ano === anoActual && mesNum >= mesActual) {
      showError('No puedes seleccionar el año y mes actual o futuro.');
      return;
    }

    const perfil = Number(user?.perfil_postventa ?? 0);
    const asesorNombre = (
      PERFILES_COMISIONES_ASESORES_FILTRO_SESION as readonly number[]
    ).includes(perfil)
      ? (user?.nombre_usuario ?? null)
      : null;

    listarMutation.mutate({
      mes: mesNum,
      ano,
      asesorNombre,
    });
  };

  const onRecargar = () => {
    setAno(getDefaultYear());
    setMes('');
    setRows([]);
  };

  const onExportExcel = async () => {
    if (rows.length === 0) {
      showError('No hay datos para exportar.');
      return;
    }
    const XLSX = await import('xlsx');

    const excelRows = rows.map((r) => ({
      Sede: r.sede,
      Asesor: r.nombre,
      Ventas: r.ventaNeta,
      'Margen Bruto (%)': Number(r.margenBruto.toFixed(2)),
      'Utilidad Bruta': r.utilidadBruta,
      'Comision (%)': Number(r.comisionPorcentaje.toFixed(2)),
      'Comision ($)': r.valorComision,
      'Comision/Ventas (%)': Number((r.comisionVentasPorcentaje * 100).toFixed(2)),
      'Comision/Ventas ($)': r.valorComisionVentas,
      'Total Comisiones': r.totalComision,
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comisiones');
    XLSX.writeFile(
      wb,
      `comisiones-asesores-repuestos-${ano}-${mes || 'mes'}.xlsx`,
    );
  };

  const onAbrirDetalle = (row: ComisionAsesorRepuesto) => {
    const mesNum = Number(mes);
    if (!mesNum || !ano) {
      showError('Primero debes seleccionar año y mes válidos.');
      return;
    }

    setDetalleTitle(`Comisiones de ${row.nombre}`);
    detalleMutation.mutate({
      nom: row.nombre,
      sede: row.sede,
      mes: mesNum,
      ano,
    });
  };

  const onExportDetalleExcel = async () => {
    if (detalleRows.length === 0) {
      showError('No hay detalle para exportar.');
      return;
    }
    const XLSX = await import('xlsx');

    const excelRows = detalleRows.map((item) => ({
      Asesor: item.nombre,
      Ventas: item.subtotal,
      Descuento: item.descuento,
      'Venta Neta': item.ventaNeta,
      Costo: item.costoNeto,
      Utilidad: item.utilidad,
      'Margen (%)': Number(item.margenBruto.toFixed(2)),
      Tipo: item.tipo,
    }));

    const ws = XLSX.utils.json_to_sheet(excelRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Detalle');

    const asesor = toFileSafeText(detalleRows[0]?.nombre ?? 'asesor');
    const month = mes || 'mes';
    XLSX.writeFile(wb, `detalle-comisiones-${asesor}-${ano}-${month}.xlsx`);
  };

  if (blocked) return null;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <h1 className="app-title-xl brand-text">
            Comisiones asesores repuestos
          </h1>
          <EmpresaBadge />
        </div>
        <p className="text-gray-500 mt-1">
          Consulta de comisiones por asesor y sede para el módulo de nómina de
          repuestos.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 md:p-6 shadow-lg space-y-4">
        <div className="app-filter-grid">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Año</label>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className={NOMINA_STYLES.input}
            >
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className={NOMINA_STYLES.input}
            >
              <option value="">Seleccione el mes de facturación</option>
              {MONTHS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onBuscar}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-(--color-primary-dark) transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
          >
            <Search size={16} className="mr-2" />
            Buscar
          </button>

          <button
            type="button"
            onClick={onRecargar}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RotateCcw size={16} className="mr-2" />
            Recargar
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-500">
            {rows.length} registro{rows.length === 1 ? '' : 's'} encontrado
            {rows.length === 1 ? '' : 's'} para {selectedMonthLabel} / {ano}
          </span>
          <button
            type="button"
            onClick={onExportExcel}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Descargar Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {listarMutation.isPending && (
          <p className="text-sm text-gray-500">Cargando información...</p>
        )}

        {!listarMutation.isPending && rows.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay información para los filtros seleccionados.
          </p>
        )}

        {!listarMutation.isPending && rows.length > 0 && (
          <div className="app-table-scroll">
            <table className="w-full min-w-[1400px] divide-y divide-gray-200 text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold">Sede</th>
                  <th className="px-3 py-2 text-center font-semibold">Asesor</th>
                  <th className="px-3 py-2 text-center font-semibold">Ventas</th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Margen Bruto
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Utilidad Bruta
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Comisión %
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Comisión $
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Comisión / ventas
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Total Comisiones
                  </th>
                  <th className="px-3 py-2 text-center font-semibold">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, index) => (
                  <tr key={`${row.nombre}-${row.sede}-${index}`}>
                    <td className="px-3 py-1.5 text-center font-semibold">
                      {row.sede}
                    </td>
                    <td className="px-3 py-1.5 text-center font-semibold">
                      {row.nombre}
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCurrency(row.ventaNeta)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs">
                        {formatPercent(row.margenBruto)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCurrency(row.utilidadBruta)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-xs">
                        {formatPercent(row.comisionPorcentaje)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      {formatCurrency(row.valorComision)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full brand-bg-light brand-text font-semibold text-xs">
                        {formatPercent(row.comisionVentasPorcentaje * 100)}
                      </span>
                      <span className="ml-2 text-xs text-gray-600">
                        ${formatCurrency(row.valorComisionVentas)}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right font-semibold">
                      {formatCurrency(row.totalComision)}
                    </td>
                    <td className="px-3 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onAbrirDetalle(row)}
                        className={NOMINA_STYLES.detailBtn}
                        title="Ver detalle"
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
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-gray-200 bg-linear-to-r from-slate-50 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight brand-text sm:text-xl">
                  {detalleTitle}
                </h2>
                <p className="text-sm text-gray-500">
                  Detalle de ventas, costos y utilidad por tipo.
                </p>
              </div>
              <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={onExportDetalleExcel}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <FileSpreadsheet size={14} className="mr-1.5" />
                  Exportar detalle
                </button>
                <button
                  type="button"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsDetalleOpen(false)}
                  aria-label="Cerrar modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
              {detalleMutation.isPending && (
                <p className="text-sm text-gray-500">Cargando detalle...</p>
              )}

              {!detalleMutation.isPending && detalleRows.length === 0 && (
                <p className="text-sm text-gray-500">
                  No se encontró detalle para este asesor y sede.
                </p>
              )}

              {!detalleMutation.isPending && detalleRows.length > 0 && (
                <div className="app-table-scroll">
                  <table className="w-full min-w-[960px] divide-y divide-gray-200 text-xs md:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-center font-semibold">
                          Asesor
                        </th>
                        <th className="px-3 py-2 text-center font-semibold">
                          Ventas
                        </th>
                        <th className="px-3 py-2 text-center font-semibold">
                          Descuento
                        </th>
                        <th className="px-3 py-2 text-center font-semibold">
                          Venta Neta
                        </th>
                        <th className="px-3 py-2 text-center font-semibold">
                          Costo
                        </th>
                        <th className="px-3 py-2 text-center font-semibold">
                          Utilidad
                        </th>
                        <th className="px-3 py-2 text-center font-semibold">
                          Margen
                        </th>
                        <th className="px-3 py-2 text-center font-semibold">
                          Tipo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {detalleRows.map((item, idx) => (
                        <tr key={`${item.nombre}-${item.tipo}-${idx}`}>
                          <td className="px-3 py-1.5 text-center font-medium">
                            {item.nombre}
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            ${formatCurrency(item.subtotal)}
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            ${formatCurrency(item.descuento)}
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            ${formatCurrency(item.ventaNeta)}
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            ${formatCurrency(item.costoNeto)}
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            ${formatCurrency(item.utilidad)}
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-xs">
                              {formatPercent(item.margenBruto)}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            {item.tipo}
                          </td>
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
