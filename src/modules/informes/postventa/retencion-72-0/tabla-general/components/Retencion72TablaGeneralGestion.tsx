'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Pagination } from '@/components/shared/ui/Pagination';
import { retencion720Service } from '@/modules/informes/postventa/services/retencion-72-0.service';
import { InformesPageFrame } from '@/modules/informes/components/InformesPageFrame';
import { INFORMES_COPY, INFORMES_PV_TRIMENU } from '@/modules/informes/constants';
import { informesKeys } from '@/modules/informes/shared/constants/query-keys';
import { useInformesPageGuard } from '@/modules/informes/shared/hooks/useInformesPageGuard';

const PAGE_SIZE = 100;

export function Retencion72TablaGeneralGestion() {
  const { blocked } = useInformesPageGuard({
    trimenuId: INFORMES_PV_TRIMENU.retencion72,
    redirectTo: '/dashboard/informes/postventa',
  });
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useQuery({
    queryKey: informesKeys.pv.retencion72(`tabla-general:${page}:${PAGE_SIZE}`),
    queryFn: () => retencion720Service.obtenerTablaGeneral(page, PAGE_SIZE),
    staleTime: 60 * 1000,
  });

  const columns = useMemo(() => {
    const first = data?.items?.[0];
    return first ? Object.keys(first) : [];
  }, [data?.items]);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  if (blocked) return null;

  return (
    <InformesPageFrame
      title="Tabla general Retención 72-0"
      description="Detalle paginado de `v_detalle_Informe_flotas`."
      backHref="/dashboard/informes/postventa/retencion-72-0"
      backLabel={`← ${INFORMES_COPY.retencion72.title}`}
    >

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
            <div className="app-table-scroll max-h-[70vh]">
              <table className="min-w-[960px] w-full text-xs">
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
    </InformesPageFrame>
  );
}

