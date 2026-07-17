'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { BODEGAS_AUDITORIA_BASE } from '@/modules/auditoria/shared/constants/bodegas';
import { auditoriaService } from '@/modules/auditoria/shared/services/auditoria.service';
import { ORDENES_TECNICOS_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 15;

type Row = {
  ano: number;
  mes: number;
  descripcion: string;
  nombres: string;
  ordenes: number;
  presupuesto_ordenes: number;
  cumplimiento: number;
};

export function OrdenesTecnicosGestion() {
  const { blocked } = useAuditoriaPageGuard(ORDENES_TECNICOS_SUBMENU_ID);
  const { showError } = useToast();
  const [bodega, setBodega] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [tecnicos, setTecnicos] = useState<Array<{ nit: string; nombre: string }>>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (blocked) return;
    auditoriaService.tecnicos().then(setTecnicos).catch(() => undefined);
  }, [blocked]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);
  const onPage = useCallback((p: number) => setPage(p), []);

  async function buscar() {
    if (!bodega && !tecnico) {
      showError('Seleccione bodega o técnico');
      return;
    }
    setLoading(true);
    try {
      const data = (await auditoriaService.ordenesTecnicos({
        bodega: bodega || undefined,
        tecnico: tecnico || undefined,
      })) as Row[];
      setRows(data);
      setPage(1);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  if (blocked) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="app-title-xl brand-text">
          Órdenes técnicos vs presupuesto últimos 6 meses
        </h1>
        <Link href="/dashboard/auditoria" className="text-sm text-amber-700 hover:underline">
          ← Volver a Auditoría
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label className="text-sm min-w-[200px]">
          Bodega
          <select
            className="mt-1 block w-full rounded border px-3 py-2"
            value={bodega}
            onChange={(e) => {
              setBodega(e.target.value);
              if (e.target.value) setTecnico('');
            }}
          >
            <option value="">Seleccione...</option>
            {BODEGAS_AUDITORIA_BASE.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm min-w-[220px]">
          Técnico
          <select
            className="mt-1 block w-full rounded border px-3 py-2"
            value={tecnico}
            onChange={(e) => {
              setTecnico(e.target.value);
              if (e.target.value) setBodega('');
            }}
          >
            <option value="">Seleccione...</option>
            {tecnicos.map((t) => (
              <option key={t.nit} value={t.nit}>
                {t.nombre}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={buscar}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white"
        >
          <Search className="h-4 w-4" /> Buscar
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white p-4 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-(--color-primary) text-white">
            <tr>
              {[
                'FECHA',
                'SEDE',
                'TÉCNICO',
                'CANTIDAD ORDENES',
                'PRESUPUESTO ORDENES',
                'CUMPLIMIENTO',
              ].map((h) => (
                <th key={h} className="px-3 py-2.5 text-center font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  Sin información
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr key={`${r.ano}-${r.mes}-${r.nombres}-${i}`} className="border-t text-center">
                  <td className="px-3 py-2">
                    {r.ano}-{String(r.mes).padStart(2, '0')}
                  </td>
                  <td className="px-3 py-2 text-left">{r.descripcion}</td>
                  <td className="px-3 py-2 text-left">{r.nombres}</td>
                  <td className="px-3 py-2">{r.ordenes}</td>
                  <td className="px-3 py-2">{r.presupuesto_ordenes.toFixed(1)}</td>
                  <td className="px-3 py-2 font-semibold">{r.cumplimiento.toFixed(1)}%</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {rows.length > 0 && totalPages > 1 && (
          <div className="mt-4">
            <Pagination currentPage={safePage} totalPages={totalPages} onChange={onPage} />
          </div>
        )}
      </div>
    </div>
  );
}
