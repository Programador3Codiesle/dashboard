'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getXlsx } from '@/utils/export-xlsx';
import { useToast } from '@/components/ui/use-toast';
import { RepuestosPageFrame } from '@/modules/repuestos/components/RepuestosPageFrame';
import { REPUESTOS_COPY } from '@/modules/repuestos/constants';
import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/repuestos/shared/constants/ui';
import { useRepuestosPageGuard } from '@/modules/repuestos/shared/hooks/useRepuestosPageGuard';
import { getErrorMessage } from '@/modules/repuestos/shared/utils/get-error-message';
import { INFORME_OBSOLETOS_SUBMENU_ID } from '@/utils/constants';
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
  const { blocked } = useRepuestosPageGuard(INFORME_OBSOLETOS_SUBMENU_ID);
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
    onError: (e: unknown) => showError(getErrorMessage(e, 'Error al consultar')),
  });

  const exportarExcel = async () => {
    const XLSX = await getXlsx();
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

  if (blocked) return null;

  return (
    <RepuestosPageFrame
      title={REPUESTOS_COPY.informeObsoletos.title}
      description={REPUESTOS_COPY.informeObsoletos.description}
    >
    <div className="space-y-4">
      <div className="space-y-3">
        {FILTROS.map((f) => (
          <div
            key={f.id}
            className="rounded-2xl border border-gray-100 bg-white p-3 sm:p-4 shadow-sm"
          >
            <p className="mb-3 text-sm font-semibold text-gray-800">{f.label}</p>
            <div className="app-form-grid-3 items-end">
              <div>
                <label className="text-xs font-medium text-gray-600">Filtro</label>
                <select
                  data-testid={`repuestos-obsoletos-categoria-${f.id}`}
                  className={`${inputClass} mt-1`}
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
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Rango</label>
                <input
                  type="number"
                  data-testid={`repuestos-obsoletos-rango-${f.id}`}
                  className={`${inputClass} mt-1`}
                  value={filtros[f.id].rango}
                  onChange={(e) =>
                    setFiltros((prev) => ({
                      ...prev,
                      [f.id]: { ...prev[f.id], rango: e.target.value },
                    }))
                  }
                />
              </div>
              <button
                type="button"
                data-testid={`repuestos-obsoletos-generar-${f.id}`}
                className={btnPrimaryClass}
                onClick={() => consultar.mutate(f.id)}
                disabled={consultar.isPending}
              >
                Generar
              </button>
            </div>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm space-y-3">
          <button type="button" className={btnPrimaryClass} onClick={exportarExcel}>
            Generar Excel
          </button>
          <div data-testid="repuestos-obsoletos-table" className="app-table-scroll">
            <table className="w-full min-w-[960px] text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {['Código', 'Descripción', 'Bodega', 'Stock', 'Costo', 'Meses', 'PVP', 'Margen %', 'Descuento %'].map((h) => (
                    <th key={h} className="px-2 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.codigo}-${r.bodega}-${i}`} className="border-t">
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
    </RepuestosPageFrame>
  );
}
