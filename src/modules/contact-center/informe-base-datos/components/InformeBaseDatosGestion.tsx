'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import { formatDateOnly } from '@/modules/contact-center/shared/utils/format-date-only';
import {
  getHeadersForTipo,
  informeBaseDatosService,
  TipoInformeDb,
} from '../services/informe-base-datos.service';

const TIPOS = [
  { value: '1' as const, label: 'CLIENTES POR TIEMPO CHEVROLET' },
  { value: '2' as const, label: 'CLIENTES POR KILOMETRAJE' },
  { value: '3' as const, label: 'CLIENTES POR FECHA DE ENTREGA' },
];

const FILAS_POR_PAGINA = 10;

function formatCellValue(value: unknown): string {
  if (value == null) return '';
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text.trim())) return formatDateOnly(text);
  return text;
}

function normalizeRows(
  raw: Record<string, unknown>[],
  headers: string[],
): string[][] {
  return raw.map((row) => {
    const values = Object.values(row);
    if (headers.length === values.length) {
      return values.map((v) => formatCellValue(v));
    }
    return headers.map((key) => {
      const normalized = key.toLowerCase().replace(/\s+/g, '_');
      const found = Object.entries(row).find(([k]) =>
        k.toLowerCase().includes(normalized.slice(0, 4)),
      );
      return found ? formatCellValue(found[1]) : '';
    });
  });
}

export function InformeBaseDatosGestion() {
  const { showError, showSuccess } = useToast();
  const [tipo, setTipo] = useState<TipoInformeDb | ''>('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [tableRows, setTableRows] = useState<string[][]>([]);
  const [paginaActual, setPaginaActual] = useState(1);

  const headers = tipo ? getHeadersForTipo(tipo) : [];

  const consultar = useMutation({
    mutationFn: () => {
      if (!tipo || !dateEnd) throw new Error('Complete los filtros obligatorios');
      if (tipo !== '2' && !dateStart) throw new Error('La fecha desde es obligatoria');
      return informeBaseDatosService.consultar({
        tipoInfDB: tipo,
        dateStart: dateStart || undefined,
        dateEnd,
      });
    },
    onSuccess: (data) => {
      if (!data.status || !tipo) {
        showError(data.message || 'No se encontraron resultados');
        setTableRows([]);
        return;
      }
      const h = getHeadersForTipo(tipo);
      setTableRows(normalizeRows(data.data, h));
      setPaginaActual(1);
      showSuccess(data.message);
    },
    onError: (e: Error) => showError(e.message),
  });

  const totalPaginas = Math.max(1, Math.ceil(tableRows.length / FILAS_POR_PAGINA));
  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA;
  const paginatedRows = useMemo(
    () => tableRows.slice(inicio, inicio + FILAS_POR_PAGINA),
    [tableRows, inicio],
  );

  const exportarExcel = () => {
    if (!tipo || tableRows.length === 0) return;
    const data = tableRows.map((vals) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i] ?? '';
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Informe');
    XLSX.writeFile(wb, 'informe-base-datos-cc.xlsx');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo (*)</label>
            <select
              className={inputClass}
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value as TipoInformeDb | '');
                setTableRows([]);
              }}
            >
              <option value="">Seleccione</option>
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {tipo === '2' ? 'Fecha inicio (km)' : 'Fecha desde'}
            </label>
            <input
              type="date"
              className={inputClass}
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Fecha hasta</label>
            <input
              type="date"
              className={inputClass}
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            className={btnPrimaryClass}
            onClick={() => consultar.mutate()}
            disabled={consultar.isPending}
          >
            Cargar
          </button>
          {tableRows.length > 0 && (
            <button type="button" className={btnSuccessClass} onClick={exportarExcel}>
              Exportar a Excel
            </button>
          )}
        </div>
      </div>

      {tableRows.length > 0 && tipo && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto space-y-3">
          <p className="text-xs text-gray-500">
            {tableRows.length} registro(s) — {FILAS_POR_PAGINA} por página
          </p>
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-2 py-2 text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((vals, idx) => (
                <tr key={inicio + idx} className="border-t">
                  {vals.map((val, i) => (
                    <td key={i} className="px-2 py-1 whitespace-nowrap">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {tableRows.length > FILAS_POR_PAGINA && (
            <div className="mt-4">
              <Pagination
                currentPage={paginaActual}
                totalPages={totalPaginas}
                onChange={setPaginaActual}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

