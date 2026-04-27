'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { FileSpreadsheet, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import {
  RelacionMargenMaterialColoristaRow,
  RelacionMargenMaterialColoristaResumen,
  SedeRelacionMargen,
  relacionMargenMaterialesColoristaService,
} from '@/modules/nomina/services/relacion-margen-materiales-colorista.service';

function formatCurrency(value: number): string {
  return Math.round(Number(value || 0)).toLocaleString('es-CO');
}

export default function RelacionMargenMaterialesColoristaPage() {
  const { showError } = useToast();
  const [mes, setMes] = useState('');
  const [sede, setSede] = useState<SedeRelacionMargen | ''>('');
  const [rows, setRows] = useState<RelacionMargenMaterialColoristaRow[]>([]);
  const [resumen, setResumen] = useState<RelacionMargenMaterialColoristaResumen | null>(null);

  const inputClass =
    'border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white w-full';

  const cargarMutation = useMutation({
    mutationFn: (params: { mes: string; sede: SedeRelacionMargen }) =>
      relacionMargenMaterialesColoristaService.listar(params.mes, params.sede),
    onSuccess: (resp) => {
      setRows(resp.rows);
      setResumen(resp.resumen);
    },
    onError: () =>
      showError('No fue posible cargar el informe relación margen materiales - colorista.'),
  });

  const onGenerar = () => {
    if (!mes || !sede) {
      showError('Debes seleccionar una fecha y una sede para cargar el informe.');
      return;
    }
    cargarMutation.mutate({ mes, sede });
  };

  const onExportar = () => {
    if (rows.length === 0) {
      showError('El informe se encuentra vacío.');
      return;
    }

    const data = rows.map((row) => ({
      Año: row.ano,
      Mes: row.nombreMes,
      Bodega: row.bodega,
      'N° Orden': row.numeroOrden,
      Valor: row.valor,
      Costo: row.costo,
      Margen: Number(row.margen.toFixed(2)),
      Comisiones: '',
    }));

    if (resumen) {
      data.push({
        Año: 0,
        Mes: '',
        Bodega: 0,
        'N° Orden': 0,
        Valor: resumen.totalValor,
        Costo: resumen.totalCosto,
        Margen: Number(resumen.margenTotal.toFixed(2)),
        Comisiones: String(resumen.bono),
      });
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RelacionMargenMateriales');
    XLSX.writeFile(wb, 'RELACION-MARGEN-MATERIALES-COLORISTA.xls');
  };

  const etiquetaSede = useMemo(() => {
    if (sede === 'giron') return 'Girón';
    if (sede === 'cucuta') return 'Cúcuta';
    return 'sin sede seleccionada';
  }, [sede]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">
          Relación margen materiales - Colorista
        </h1>
        <p className="text-gray-500 mt-1">
          Informe de margen por orden con cálculo consolidado y bonificación.
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Fecha</label>
            <input
              className={inputClass}
              type="month"
              value={mes}
              min="2024-01"
              max={new Date().toISOString().slice(0, 7)}
              onChange={(e) => setMes(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Sede</label>
            <select
              className={inputClass}
              value={sede}
              onChange={(e) => setSede(e.target.value as SedeRelacionMargen | '')}
            >
              <option value="">Seleccione una sede</option>
              <option value="giron">Girón</option>
              <option value="cucuta">Cúcuta</option>
            </select>
          </div>
          <button
            type="button"
            onClick={onGenerar}
            disabled={cargarMutation.isPending}
            className="inline-flex items-center justify-center rounded-xl bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Search size={16} className="mr-2" />
            {cargarMutation.isPending ? 'Generando...' : 'Generar'}
          </button>
          <button
            type="button"
            onClick={onExportar}
            className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <FileSpreadsheet size={16} className="mr-2" />
            Descargar Excel
          </button>
        </div>
        <p className="text-xs text-gray-500">
          {rows.length} registros para {mes || 'sin fecha'} - {etiquetaSede}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 shadow-sm">
        {cargarMutation.isPending && (
          <div className="space-y-2">
            <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-8 animate-pulse rounded-lg bg-gray-100" />
          </div>
        )}

        {!cargarMutation.isPending && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              No hay datos para mostrar.
            </p>
          </div>
        )}

        {!cargarMutation.isPending && rows.length > 0 && (
          <div className="overflow-auto rounded-xl border border-gray-100 max-h-120">
            <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-center font-semibold">Año</th>
                  <th className="px-3 py-2 text-center font-semibold">Mes</th>
                  <th className="px-3 py-2 text-center font-semibold">Bodega</th>
                  <th className="px-3 py-2 text-center font-semibold">N° Orden</th>
                  <th className="px-3 py-2 text-right font-semibold">Valor</th>
                  <th className="px-3 py-2 text-right font-semibold">Costo</th>
                  <th className="px-3 py-2 text-right font-semibold">Margen</th>
                  <th className="px-3 py-2 text-right font-semibold">Comisiones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={`${row.ano}-${row.mes}-${row.bodega}-${row.numeroOrden}`}>
                    <td className="px-3 py-1.5 text-center">{row.ano}</td>
                    <td className="px-3 py-1.5 text-center">{row.nombreMes}</td>
                    <td className="px-3 py-1.5 text-center">{row.bodega}</td>
                    <td className="px-3 py-1.5 text-center">{row.numeroOrden}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.valor)}</td>
                    <td className="px-3 py-1.5 text-right">{formatCurrency(row.costo)}</td>
                    <td className="px-3 py-1.5 text-right">{row.margen.toFixed(2)}%</td>
                    <td className="px-3 py-1.5 text-right" />
                  </tr>
                ))}
                {resumen && (
                  <tr className="font-semibold bg-gray-200/70">
                    <td className="px-3 py-2 text-center">--</td>
                    <td className="px-3 py-2 text-center">--</td>
                    <td className="px-3 py-2 text-center">--</td>
                    <td className="px-3 py-2">Total General</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(resumen.totalValor)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(resumen.totalCosto)}</td>
                    <td className="px-3 py-2 text-right">{resumen.margenTotal.toFixed(2)}%</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(resumen.bono)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

