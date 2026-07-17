'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { useToast } from '@/components/ui/use-toast';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { BODEGAS_FACTURACION_TALLER } from '@/modules/auditoria/shared/constants/bodegas';
import { auditoriaService } from '@/modules/auditoria/shared/services/auditoria.service';
import { FACTURACION_TALLER_SUBMENU_ID } from '@/utils/constants';

const PAGE_SIZE = 15;

type Row = {
  ano: number;
  mes: number;
  descripcion: string;
  venta_rptos: number;
  presupuesto_rptos: number;
  cumplimiento_rptos: number;
  venta_mano_obra: number;
  presupuesto_mano_obra: number;
  cumplimiento_mo: number;
  venta_tot: number;
  presupuesto_tot: number;
  cumplimiento_tot: number;
};

export function FacturacionTallerGestion() {
  const { blocked } = useAuditoriaPageGuard(FACTURACION_TALLER_SUBMENU_ID);
  const { showError } = useToast();
  const [bodega, setBodega] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);
  const onPage = useCallback((p: number) => setPage(p), []);

  async function buscar() {
    if (!bodega) {
      showError('Seleccione una bodega');
      return;
    }
    setLoading(true);
    try {
      const data = (await auditoriaService.facturacionTaller(bodega)) as Row[];
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
          Facturación total taller vs presupuesto
        </h1>
        <Link href="/dashboard/auditoria" className="text-sm text-amber-700 hover:underline">
          ← Volver a Auditoría
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border bg-white p-4 shadow-sm">
        <label className="text-sm min-w-[240px]">
          Bodega
          <select
            className="mt-1 block w-full rounded border px-3 py-2"
            value={bodega}
            onChange={(e) => setBodega(e.target.value)}
          >
            <option value="">Seleccione...</option>
            {BODEGAS_FACTURACION_TALLER.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
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
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-(--color-primary) text-white">
            <tr>
              {[
                'FECHA',
                'SEDE',
                'VENTA REPUESTOS',
                'PPT REPUESTOS',
                '% REPUESTOS',
                'VENTA MO',
                'PPT MO',
                '% MO',
                'VENTA TOT',
                'PPT TOT',
                '% TOT',
              ].map((h) => (
                <th key={h} className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-500">
                  Sin información
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={`${r.ano}-${r.mes}`} className="border-t text-center">
                  <td className="px-2 py-2">{r.ano}-{String(r.mes).padStart(2, '0')}</td>
                  <td className="px-2 py-2 text-left">{r.descripcion}</td>
                  <td className="px-2 py-2 bg-pink-50">{fmt(r.venta_rptos)}</td>
                  <td className="px-2 py-2">{fmt(r.presupuesto_rptos)}</td>
                  <td className="px-2 py-2 font-semibold">{r.cumplimiento_rptos.toFixed(1)}%</td>
                  <td className="px-2 py-2 bg-emerald-50">{fmt(r.venta_mano_obra)}</td>
                  <td className="px-2 py-2">{fmt(r.presupuesto_mano_obra)}</td>
                  <td className="px-2 py-2 font-semibold">{r.cumplimiento_mo.toFixed(1)}%</td>
                  <td className="px-2 py-2 bg-amber-50">{fmt(r.venta_tot)}</td>
                  <td className="px-2 py-2">{fmt(r.presupuesto_tot)}</td>
                  <td className="px-2 py-2 font-semibold">{r.cumplimiento_tot.toFixed(1)}%</td>
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

function fmt(n: number) {
  return n.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}
