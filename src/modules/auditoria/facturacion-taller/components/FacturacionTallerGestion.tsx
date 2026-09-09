'use client';

import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { useToast } from '@/components/ui/use-toast';
import { AuditoriaPageFrame } from '@/modules/auditoria/components/AuditoriaPageFrame';
import { AUDITORIA_COPY } from '@/modules/auditoria/constants';
import { AuditoriaPager } from '@/modules/auditoria/shared/components/AuditoriaPager';
import { AuditoriaQueryError } from '@/modules/auditoria/shared/components/AuditoriaQueryError';
import { AuditoriaTableCard } from '@/modules/auditoria/shared/components/AuditoriaTableCard';
import { BODEGAS_FACTURACION_TALLER } from '@/modules/auditoria/shared/constants/bodegas';
import { auditoriaKeys } from '@/modules/auditoria/shared/constants/query-keys';
import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/auditoria/shared/constants/ui';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { auditoriaService } from '@/modules/auditoria/shared/services/auditoria.service';
import { getErrorMessage } from '@/modules/auditoria/shared/utils/parse-api-error';
import { paginateRows } from '@/modules/auditoria/shared/utils/paginate';
import { FACTURACION_TALLER_SUBMENU_ID } from '@/utils/constants';

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

const colRptos =
  'bg-[color-mix(in_srgb,var(--color-danger)_14%,white)]';
const colMo =
  'bg-[color-mix(in_srgb,var(--color-success)_14%,white)]';
const colTot =
  'bg-[color-mix(in_srgb,var(--color-warning)_18%,white)]';

export function FacturacionTallerGestion() {
  const { user, blocked } = useAuditoriaPageGuard(FACTURACION_TALLER_SUBMENU_ID);
  const { showError } = useToast();
  const sesionLista = !!user && !blocked;
  const [bodega, setBodega] = useState('');
  const [applied, setApplied] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: auditoriaKeys.facturacionTaller(applied ?? ''),
    queryFn: () => auditoriaService.facturacionTaller(applied!) as Promise<Row[]>,
    enabled: sesionLista && !!applied,
    ...transactionalQueryOptions,
  });

  const rows = listQuery.data ?? [];
  const { pageRows, total, totalPages, safePage, inicio, fin } = paginateRows(
    rows,
    page,
  );
  const onPage = useCallback((p: number) => setPage(p), []);

  if (blocked) return null;

  return (
    <AuditoriaPageFrame
      title={AUDITORIA_COPY.facturacionTaller.title}
      description={AUDITORIA_COPY.facturacionTaller.description}
      backLabel={AUDITORIA_COPY.backLabel}
    >
      <div className="app-section-card w-full min-w-0">
        <div className="app-form-grid-2 items-end">
          <label htmlFor="aud-ft-bodega" className="w-full min-w-0 text-sm">
            Bodega
            <select
              id="aud-ft-bodega"
              data-testid="aud-ft-bodega"
              className={inputClass}
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
            data-testid="aud-ft-buscar"
            className={btnPrimaryClass}
            disabled={listQuery.isFetching}
            onClick={() => {
              if (!bodega) {
                showError('Seleccione una bodega');
                return;
              }
              setApplied(bodega);
              setPage(1);
            }}
          >
            <Search className="h-4 w-4" /> Buscar
          </button>
        </div>
      </div>

      {listQuery.isError ? (
        <AuditoriaQueryError
          message={getErrorMessage(
            listQuery.error,
            AUDITORIA_COPY.facturacionTaller.loadError,
          )}
        />
      ) : null}

      <AuditoriaTableCard
        footer={
          <AuditoriaPager
            total={total}
            page={safePage}
            totalPages={totalPages}
            onChange={onPage}
            inicio={inicio}
            fin={fin}
          />
        }
      >
        <table className="w-full min-w-[1080px] text-xs md:text-sm">
          <thead className="brand-bg text-white">
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
                <th
                  key={h}
                  className="whitespace-nowrap px-2 py-2 text-center font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listQuery.isFetching && !listQuery.data ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-500">
                  {AUDITORIA_COPY.facturacionTaller.empty}
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={`${r.ano}-${r.mes}`} className="border-t text-center">
                  <td className="px-2 py-2">
                    {r.ano}-{String(r.mes).padStart(2, '0')}
                  </td>
                  <td className="px-2 py-2 text-left">{r.descripcion}</td>
                  <td className={`px-2 py-2 ${colRptos}`}>{fmt(r.venta_rptos)}</td>
                  <td className={`px-2 py-2 ${colRptos}`}>
                    {fmt(r.presupuesto_rptos)}
                  </td>
                  <td className={`px-2 py-2 font-semibold ${colRptos}`}>
                    {r.cumplimiento_rptos.toFixed(1)}%
                  </td>
                  <td className={`px-2 py-2 ${colMo}`}>
                    {fmt(r.venta_mano_obra)}
                  </td>
                  <td className={`px-2 py-2 ${colMo}`}>
                    {fmt(r.presupuesto_mano_obra)}
                  </td>
                  <td className={`px-2 py-2 font-semibold ${colMo}`}>
                    {r.cumplimiento_mo.toFixed(1)}%
                  </td>
                  <td className={`px-2 py-2 ${colTot}`}>{fmt(r.venta_tot)}</td>
                  <td className={`px-2 py-2 ${colTot}`}>
                    {fmt(r.presupuesto_tot)}
                  </td>
                  <td className={`px-2 py-2 font-semibold ${colTot}`}>
                    {r.cumplimiento_tot.toFixed(1)}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AuditoriaTableCard>
    </AuditoriaPageFrame>
  );
}

function fmt(n: number) {
  return n.toLocaleString('es-CO', { maximumFractionDigits: 0 });
}
