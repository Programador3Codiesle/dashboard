'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getXlsx } from '@/utils/export-xlsx';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { ContactCenterPageFrame } from '@/modules/contact-center/components/ContactCenterPageFrame';
import { CONTACT_CENTER_COPY } from '@/modules/contact-center/constants';
import {
  btnPrimaryClass,
  btnSuccessClass,
  inputClass,
} from '@/modules/contact-center/shared/constants/ui';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { formatDateOnly } from '@/modules/contact-center/shared/utils/format-date-only';
import { getErrorMessage } from '@/modules/contact-center/shared/utils/get-error-message';
import { INFORME_BASE_DATOS_CC_SUBMENU_ID } from '@/utils/constants';
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
  const { blocked } = useContactCenterPageGuard(INFORME_BASE_DATOS_CC_SUBMENU_ID);
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
    onError: (e: unknown) => showError(getErrorMessage(e, 'Error al consultar informe')),
  });

  const totalPaginas = Math.max(1, Math.ceil(tableRows.length / FILAS_POR_PAGINA));
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaSegura - 1) * FILAS_POR_PAGINA;
  const paginatedRows = useMemo(
    () => tableRows.slice(inicio, inicio + FILAS_POR_PAGINA),
    [tableRows, inicio],
  );

  const exportarExcel = async () => {
    const XLSX = await getXlsx();
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

  if (blocked) return null;

  return (
    <ContactCenterPageFrame
      title={CONTACT_CENTER_COPY.informeBaseDatos.title}
      description={CONTACT_CENTER_COPY.informeBaseDatos.description}
    >
    <div className="space-y-4">
      <div className="app-section-card w-full min-w-0">
        <div className="app-form-grid-3">
          <div>
            <label htmlFor="cc-bdc-tipo" className="text-sm font-medium text-gray-700">Tipo (*)</label>
            <select
              id="cc-bdc-tipo"
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
            <label htmlFor="cc-bdc-fecha-desde" className="text-sm font-medium text-gray-700">
              {tipo === '2' ? 'Fecha inicio (km)' : 'Fecha desde'}
            </label>
            <input
              id="cc-bdc-fecha-desde"
              type="date"
              className={inputClass}
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cc-bdc-fecha-hasta" className="text-sm font-medium text-gray-700">Fecha hasta</label>
            <input
              id="cc-bdc-fecha-hasta"
              type="date"
              className={inputClass}
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
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
        <div className="app-section-card w-full min-w-0 space-y-3">
          <p className="text-xs text-gray-500">
            {tableRows.length} registro(s) — {FILAS_POR_PAGINA} por página
          </p>
          <div className="app-table-scroll">
          <table className="w-full min-w-[960px] text-xs">
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
          </div>
          {tableRows.length > FILAS_POR_PAGINA && (
            <div className="mt-4">
              <Pagination
                currentPage={paginaSegura}
                totalPages={totalPaginas}
                onChange={setPaginaActual}
              />
            </div>
          )}
        </div>
      )}
    </div>
    </ContactCenterPageFrame>
  );
}

