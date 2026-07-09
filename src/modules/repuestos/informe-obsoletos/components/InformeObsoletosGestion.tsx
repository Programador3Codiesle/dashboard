'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/repuestos/shared/constants/ui';
import {
  informeObsoletosService,
  ObsoletoFiltroRow,
} from '../services/informe-obsoletos.service';

const FILTROS = [
  { id: 1, label: '0 - 12' },
  { id: 2, label: '9 - 12' },
  { id: 3, label: '12 - 24' },
  { id: 4, label: '> 24' },
] as const;

type FiltroState = {
  categoria: '' | '1' | '2';
  rango: string;
};

export function InformeObsoletosGestion() {
  const { showError } = useToast();
  const [filtros, setFiltros] = useState<Record<number, FiltroState>>({
    1: { categoria: '', rango: '' },
    2: { categoria: '', rango: '' },
    3: { categoria: '', rango: '' },
    4: { categoria: '', rango: '' },
  });
  const [rows, setRows] = useState<ObsoletoFiltroRow[]>([]);
  const [descuentos, setDescuentos] = useState<Record<string, number>>({});

  const consultar = useMutation({
    mutationFn: (opcion: 1 | 2 | 3 | 4) => {
      const f = filtros[opcion];
      if (!f.categoria || !f.rango) throw new Error('Complete filtro y rango');
      return informeObsoletosService.consultar({
        opcion,
        categoria: Number(f.categoria) as 1 | 2,
        rango: Number(f.rango),
      });
    },
    onSuccess: (data) => {
      setRows(data);
      setDescuentos({});
    },
    onError: (e: Error) => showError(e.message),
  });

  const exportarExcel = () => {
    if (rows.length === 0) return;
    const data = rows.map((r) => ({
      Codigo: r.codigo,
      Descripcion: r.descripcion,
      Bodega: r.bodega,
      Stock: r.stock,
      'Costo unitario': r.costoUnitario,
      'Costo promedio': r.costoPromedio,
      Meses: r.meses,
      PVP: r.pvp,
      Margen: r.margen,
      Descuento: descuentos[r.codigo] ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Obsoletos');
    XLSX.writeFile(wb, 'informe-obsoletos-filtro.xlsx');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {['Categoría', 'Filtro', 'Rango', ''].map((h) => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FILTROS.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="px-3 py-2">{f.label}</td>
                <td className="px-3 py-2">
                  <select
                    className={inputClass}
                    value={filtros[f.id].categoria}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        [f.id]: { ...prev[f.id], categoria: e.target.value as '' | '1' | '2' },
                      }))
                    }
                  >
                    <option value="">Seleccione</option>
                    <option value="1">MAYOR QUE &gt;</option>
                    <option value="2">MENOR QUE &lt;</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    className={inputClass}
                    value={filtros[f.id].rango}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        [f.id]: { ...prev[f.id], rango: e.target.value },
                      }))
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className={btnPrimaryClass}
                    onClick={() => consultar.mutate(f.id)}
                    disabled={consultar.isPending}
                  >
                    Generar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
          <button type="button" className={btnPrimaryClass} onClick={exportarExcel}>
            Generar Excel
          </button>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {['Código', 'Descripción', 'Bodega', 'Stock', 'Costo', 'Meses', 'PVP', 'Margen %', 'Descuento %'].map((h) => (
                    <th key={h} className="px-2 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={`${r.codigo}-${r.bodega}`} className="border-t">
                    <td className="px-2 py-1">{r.codigo}</td>
                    <td className="px-2 py-1">{r.descripcion}</td>
                    <td className="px-2 py-1 text-center">{r.bodega}</td>
                    <td className="px-2 py-1 text-center">{r.stock}</td>
                    <td className="px-2 py-1 text-right">{r.costoUnitario.toFixed(2)}</td>
                    <td className="px-2 py-1 text-center">{r.meses}</td>
                    <td className="px-2 py-1 text-right">{r.pvp.toFixed(2)}</td>
                    <td className="px-2 py-1 text-right">{r.margen.toFixed(2)}</td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="w-16 rounded border px-1"
                        value={descuentos[r.codigo] ?? ''}
                        onChange={(e) =>
                          setDescuentos((prev) => ({
                            ...prev,
                            [r.codigo]: Number(e.target.value),
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
