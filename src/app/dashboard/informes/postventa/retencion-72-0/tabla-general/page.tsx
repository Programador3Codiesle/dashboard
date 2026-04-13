'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { retencion720Service } from '@/modules/informes/postventa/services/retencion-72-0.service';

const PAGE_SIZE = 100;

export default function Retencion720TablaGeneralPage() {
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useQuery({
    queryKey: ['retencion-72-0', 'tabla-general', page, PAGE_SIZE],
    queryFn: () => retencion720Service.obtenerTablaGeneral(page, PAGE_SIZE),
    staleTime: 60 * 1000,
  });

  const columns = useMemo(() => {
    const first = data?.items?.[0];
    return first ? Object.keys(first) : [];
  }, [data?.items]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold brand-text">Tabla general Retención 72-0</h1>
        <p className="text-sm text-gray-500">Detalle paginado de `v_detalle_Informe_flotas`.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4">
        {isPending ? (
          <div className="py-10 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={18} />
            Cargando tabla general...
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-red-600 text-sm">
            No se pudo cargar la tabla general.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-auto max-h-[70vh] border rounded">
              <table className="min-w-full text-xs">
                <thead className="sticky top-0 bg-slate-100 z-10">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="px-2 py-2 text-left whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.items ?? []).map((row, idx) => (
                    <tr key={idx} className="border-t">
                      {columns.map((col) => (
                        <td key={`${idx}-${col}`} className="px-2 py-1 whitespace-nowrap">
                          {String((row as Record<string, unknown>)[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}

