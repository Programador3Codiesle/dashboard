'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileSpreadsheet, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import {
  NominaDirectorFlotasDetalle,
  NominaDirectorFlotasPrincipal,
  nominaDirectorFlotasService,
} from '@/modules/nomina/services/nomina-director-flotas.service';

function formatCurrency(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString('es-CO');
}

export default function NominaDirectorFlotasPage() {
  const { showError } = useToast();
  const [mes, setMes] = useState('');
  const [principalRows, setPrincipalRows] = useState<NominaDirectorFlotasPrincipal[]>([]);
  const [detalleRows, setDetalleRows] = useState<NominaDirectorFlotasDetalle[]>([]);

  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const generarMutation = useMutation({
    mutationFn: async (month: string) => {
      const [principal, detalle] = await Promise.all([
        nominaDirectorFlotasService.listarPrincipal(month),
        nominaDirectorFlotasService.listarDetalle(month),
      ]);
      return { principal, detalle };
    },
    onSuccess: ({ principal, detalle }) => {
      setPrincipalRows(principal);
      setDetalleRows(detalle);
    },
    onError: () => showError('No fue posible cargar la nómina director flotas.'),
  });

  const resumenMes = useMemo(() => (mes ? mes : 'sin mes seleccionado'), [mes]);
  const totalVentas = useMemo(
    () => principalRows.reduce((acc, row) => acc + Number(row.venta || 0), 0),
    [principalRows],
  );

  const onGenerar = () => {
    if (!mes) {
      showError('Debes seleccionar un mes y año.');
      return;
    }
    generarMutation.mutate(mes);
  };

  const onExportarPrincipal = () => {
    if (principalRows.length === 0) {
      showError('No hay datos de placas nuevas para exportar.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      principalRows.map((row) => ({
        '#': row.item,
        NIT: row.nit,
        Nombre: row.nombres,
        Placa: row.placa,
        Venta: row.venta,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PlacasNuevas');
    XLSX.writeFile(wb, `nomina-director-flotas-placas-${mes || 'sin-mes'}.xlsx`);
  };

  const onExportarDetalle = () => {
    if (detalleRows.length === 0) {
      showError('No hay datos de actualización flota para exportar.');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(
      detalleRows.map((row) => ({
        '#': row.item,
        NIT: row.nit,
        Nombre: row.nombres,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ActualizacionFlota');
    XLSX.writeFile(wb, `nomina-director-flotas-detalle-${mes || 'sin-mes'}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Nómina director flotas
        </h1>
        <p className="text-gray-500 mt-1">
          Consolidado de placas nuevas ingresadas al taller y actualización de flota.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Mes</label>
            <input
              type="month"
              className={inputClass}
              value={mes}
              onChange={(e) => setMes(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={onGenerar}
            disabled={generarMutation.isPending}
            className="inline-flex items-center justify-center rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Search size={16} className="mr-2" />
            {generarMutation.isPending ? 'Generando...' : 'Generar nómina'}
          </button>
          <button
            type="button"
            onClick={onExportarPrincipal}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Exportar placas nuevas
          </button>
          <button
            type="button"
            onClick={onExportarDetalle}
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Exportar actualización
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span>{principalRows.length} placas para {resumenMes}</span>
          <span>•</span>
          <span>{detalleRows.length} asesores en actualización</span>
          <span>•</span>
          <span>Total ventas: ${formatCurrency(totalVentas)}</span>
        </div>
      </div>

      {generarMutation.isPending && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="space-y-2">
            <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      )}

      {!generarMutation.isPending && principalRows.length === 0 && detalleRows.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">
            No hay datos para mostrar.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Selecciona un mes para consultar la información de nómina director flotas.
          </p>
        </div>
      )}

      {!generarMutation.isPending && (principalRows.length > 0 || detalleRows.length > 0) && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Placas nuevas ingresadas al taller
            </h2>
            <div className="overflow-auto rounded-xl border border-gray-100 max-h-112">
              <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-center font-semibold">#</th>
                    <th className="px-3 py-2 text-center font-semibold">NIT</th>
                    <th className="px-3 py-2 text-center font-semibold">Nombre</th>
                    <th className="px-3 py-2 text-center font-semibold">Placa</th>
                    <th className="px-3 py-2 text-center font-semibold">Venta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {principalRows.map((row) => (
                    <tr key={`${row.nit}-${row.placa}-${row.item}`}>
                      <td className="px-3 py-1.5 text-center">{row.item}</td>
                      <td className="px-3 py-1.5 text-center">{row.nit}</td>
                      <td className="px-3 py-1.5">{row.nombres}</td>
                      <td className="px-3 py-1.5 text-center">{row.placa}</td>
                      <td className="px-3 py-1.5 text-right">${formatCurrency(row.venta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Actualización flota
            </h2>
            <div className="overflow-auto rounded-xl border border-gray-100 max-h-112">
              <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-center font-semibold">#</th>
                    <th className="px-3 py-2 text-center font-semibold">NIT</th>
                    <th className="px-3 py-2 text-center font-semibold">Nombre</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detalleRows.map((row) => (
                    <tr key={`${row.nit}-${row.item}`}>
                      <td className="px-3 py-1.5 text-center">{row.item}</td>
                      <td className="px-3 py-1.5 text-center">{row.nit}</td>
                      <td className="px-3 py-1.5">{row.nombres}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

