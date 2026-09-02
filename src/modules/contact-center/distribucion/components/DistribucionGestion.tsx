'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { ContactCenterPageFrame } from '@/modules/contact-center/components/ContactCenterPageFrame';
import { CONTACT_CENTER_COPY } from '@/modules/contact-center/constants';
import { CcQueryError } from '@/modules/contact-center/shared/components/CcQueryError';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { getErrorMessage } from '@/modules/contact-center/shared/utils/get-error-message';
import { DISTRIBUCION_CC_SUBMENU_ID } from '@/utils/constants';
import {
  CeldaDistribucion,
  distribucionService,
  MatrizDistribucion,
} from '../services/distribucion.service';
import { DistribucionPorcentajeInput } from './DistribucionPorcentajeInput';

function celdaKey(agente: number, bodega: number) {
  return `${agente}-${bodega}`;
}

function patchMatrizCelda(
  matriz: MatrizDistribucion,
  agente: number,
  bodega: number,
  patch: Partial<Pick<CeldaDistribucion, 'asignado' | 'distribucion'>>,
): MatrizDistribucion {
  return {
    ...matriz,
    celdas: matriz.celdas.map((c) =>
      c.agente === agente && c.bodega === bodega ? { ...c, ...patch } : c,
    ),
  };
}

export function DistribucionGestion() {
  const { user, blocked } = useContactCenterPageGuard(DISTRIBUCION_CC_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [togglePending, setTogglePending] = useState<string | null>(null);

  const { data: matriz, isLoading, isError, error } = useQuery({
    queryKey: ['contact-center', 'distribucion', 'matriz'],
    queryFn: () => distribucionService.obtenerMatriz(),
    enabled: !!user && !blocked,
    ...transactionalQueryOptions,
  });

  const { data: totales = [] } = useQuery({
    queryKey: ['contact-center', 'distribucion', 'totales'],
    queryFn: () => distribucionService.obtenerTotales(),
    enabled: !!user && !blocked,
    ...transactionalQueryOptions,
  });

  const celdasMap = useMemo(() => {
    const map = new Map<string, CeldaDistribucion>();
    matriz?.celdas.forEach((c) => {
      map.set(celdaKey(c.agente, c.bodega), c);
    });
    return map;
  }, [matriz?.celdas]);

  const invalidateTotales = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['contact-center', 'distribucion', 'totales'],
    });
  }, [queryClient]);

  const toggle = useMutation({
    mutationFn: (payload: { agente: number; bodega: number; activo: boolean }) => {
      const key = celdaKey(payload.agente, payload.bodega);
      setTogglePending(key);
      return distribucionService.toggle(payload);
    },
    onSuccess: (_data, vars) => {
      showSuccess('Asignación actualizada');
      queryClient.setQueryData<MatrizDistribucion>(
        ['contact-center', 'distribucion', 'matriz'],
        (prev) =>
          prev
            ? patchMatrizCelda(prev, vars.agente, vars.bodega, {
                asignado: vars.activo,
                distribucion: vars.activo ? 0 : null,
              })
            : prev,
      );
      invalidateTotales();
    },
    onError: (e: unknown) => showError(getErrorMessage(e, 'Error al actualizar asignación')),
    onSettled: () => setTogglePending(null),
  });

  const updateDist = useMutation({
    mutationFn: (payload: { agente: number; bodega: number; distribucion: number }) =>
      distribucionService.updateDistribucion(payload),
    onSuccess: (_data, vars) => {
      showSuccess('Distribución actualizada');
      queryClient.setQueryData<MatrizDistribucion>(
        ['contact-center', 'distribucion', 'matriz'],
        (prev) =>
          prev
            ? patchMatrizCelda(prev, vars.agente, vars.bodega, {
                distribucion: vars.distribucion,
              })
            : prev,
      );
      invalidateTotales();
    },
    onError: (e: unknown) => showError(getErrorMessage(e, 'Error al actualizar distribución')),
  });

  const handleSavePorcentaje = useCallback(
    (payload: { agente: number; bodega: number; distribucion: number }) => {
      updateDist.mutate(payload);
    },
    [updateDist],
  );

  if (blocked) return null;

  return (
    <ContactCenterPageFrame
      title={CONTACT_CENTER_COPY.distribucion.title}
      description={CONTACT_CENTER_COPY.distribucion.description}
    >
    {isLoading ? (
      <p className="text-gray-500 text-sm">Cargando matriz...</p>
    ) : isError || !matriz ? (
      <CcQueryError
        message={getErrorMessage(error, 'Error al cargar la matriz de distribución')}
      />
    ) : (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-sm text-gray-600">
        Distribución para mes <strong>{matriz.mes}</strong> / año <strong>{matriz.anio}</strong>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm overflow-x-auto space-y-6">
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Asignación agente × bodega</h3>
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-left sticky left-0 bg-gray-50">Agente</th>
                {matriz.bodegas.map((b) => (
                  <th key={b.bodega} className="px-2 py-2 text-center">{b.bodega}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matriz.agentes.map((a) => (
                <tr key={a.nitReal} className="border-t">
                  <td className="px-2 py-2 font-medium sticky left-0 bg-white whitespace-nowrap">
                    {a.nombres}
                  </td>
                  {matriz.bodegas.map((b) => {
                    const key = celdaKey(a.nitReal, b.bodega);
                    const celda = celdasMap.get(key);
                    const asignado = celda?.asignado ?? false;
                    return (
                      <td key={b.bodega} className="px-2 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={asignado}
                          onChange={() =>
                            toggle.mutate({
                              agente: a.nitReal,
                              bodega: b.bodega,
                              activo: !asignado,
                            })
                          }
                          disabled={togglePending === key}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Porcentaje de distribución (%)</h3>
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 py-2 text-left sticky left-0 bg-gray-50">Agente</th>
                {matriz.bodegas.map((b) => (
                  <th key={b.bodega} className="px-2 py-2 text-center">{b.bodega}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matriz.agentes.map((a) => (
                <tr key={a.nitReal} className="border-t">
                  <td className="px-2 py-2 font-medium sticky left-0 bg-white whitespace-nowrap">
                    {a.nombres}
                  </td>
                  {matriz.bodegas.map((b) => {
                    const key = celdaKey(a.nitReal, b.bodega);
                    const celda = celdasMap.get(key);
                    return (
                      <td key={b.bodega} className="px-2 py-1 text-center">
                        <DistribucionPorcentajeInput
                          key={`${celda?.asignado ? 1 : 0}-${celda?.distribucion ?? ''}`}
                          agente={a.nitReal}
                          bodega={b.bodega}
                          asignado={celda?.asignado ?? false}
                          distribucion={celda?.distribucion ?? null}
                          onSave={handleSavePorcentaje}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Totales por bodega</h3>
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-gray-50">
                {totales.map((t) => (
                  <th key={t.bodega} className="px-3 py-2 text-center">{t.bodega}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {totales.map((t) => (
                  <td
                    key={t.bodega}
                    className={`px-3 py-2 text-center font-semibold ${
                      t.distSede > 100 ? 'text-red-600' : 'text-gray-800'
                    }`}
                  >
                    {t.distSede}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    )}
    </ContactCenterPageFrame>
  );
}
