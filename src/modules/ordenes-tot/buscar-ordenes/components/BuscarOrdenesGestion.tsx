'use client';

import type { ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { OrdenesTotPageFrame } from '@/modules/ordenes-tot/components/OrdenesTotPageFrame';
import { ORDENES_TOT_COPY } from '@/modules/ordenes-tot/constants';
import { OtQueryError } from '@/modules/ordenes-tot/shared/components/OtQueryError';
import {
  btnPrimaryClass,
  btnSuccessClass,
  porteriaAccentGeneral,
  porteriaAccentTot,
  porteriaAccentVehiculos,
} from '@/modules/ordenes-tot/shared/constants/ui';
import { ordenesTotKeys } from '@/modules/ordenes-tot/shared/constants/query-keys';
import { useOrdenesTotPageGuard } from '@/modules/ordenes-tot/shared/hooks/useOrdenesTotPageGuard';
import {
  ordenesTotService,
  type PorteriaItem,
} from '@/modules/ordenes-tot/shared/services/ordenes-tot.service';
import { getErrorMessage } from '@/modules/ordenes-tot/shared/utils/parse-api-error';
import { BUSCAR_ORDENES_SUBMENU_ID } from '@/utils/constants';

const POLL_MS = 3000;

function PorteriaCard({
  item,
  title,
  accentClass,
  buttonClass,
  actionLabel,
  onAction,
  pending,
  extraFields,
}: {
  item: PorteriaItem;
  title: string;
  accentClass: string;
  buttonClass: string;
  actionLabel: string;
  onAction: () => void;
  pending: boolean;
  extraFields?: ReactNode;
}) {
  return (
    <div className={`min-w-0 overflow-hidden rounded-xl border border-gray-200/70 bg-white shadow-sm ${accentClass}`}>
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="break-words text-base font-bold text-gray-900">{title}</h3>
      </div>
      <div className="min-w-0 space-y-1 px-4 py-3 text-sm text-gray-700">
        <p>
          AUTORIZA: <strong>{item.nombres || '—'}</strong>
        </p>
        {item.orden ? (
          <p>
            ORDEN N°: <strong>{item.orden}</strong>
          </p>
        ) : null}
        {extraFields}
        <p>
          FECHA: <strong>{item.fechaIngreso || '—'}</strong>
        </p>
        <hr className="my-3 border-gray-100" />
        <button
          type="button"
          className={buttonClass}
          disabled={pending || !item.id}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

export function BuscarOrdenesGestion() {
  const { user, blocked } = useOrdenesTotPageGuard(BUSCAR_ORDENES_SUBMENU_ID);
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;

  const vehiculosQuery = useQuery({
    queryKey: ordenesTotKeys.porteriaVehiculos,
    queryFn: () => ordenesTotService.porteriaVehiculos(),
    refetchInterval: POLL_MS,
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const totQuery = useQuery({
    queryKey: ordenesTotKeys.porteriaTot,
    queryFn: () => ordenesTotService.porteriaTot(),
    refetchInterval: POLL_MS,
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const ordenesQuery = useQuery({
    queryKey: ordenesTotKeys.porteriaOrdenes,
    queryFn: () => ordenesTotService.porteriaOrdenesGenerales(),
    refetchInterval: POLL_MS,
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const invalidatePorteria = () => {
    queryClient.invalidateQueries({ queryKey: ordenesTotKeys.porteria });
  };

  const confirmarSalida = useMutation({
    mutationFn: (id: number) => ordenesTotService.confirmarSalida(id),
    onSuccess: () => {
      showSuccess('Salida confirmada');
      invalidatePorteria();
    },
    onError: (e: unknown) =>
      showError(getErrorMessage(e, 'Error al confirmar salida')),
  });

  const confirmarReingreso = useMutation({
    mutationFn: (id: number) => ordenesTotService.reingresoTot(id),
    onSuccess: () => {
      showSuccess('Reingreso confirmado');
      invalidatePorteria();
    },
    onError: (e: unknown) =>
      showError(getErrorMessage(e, 'Error al confirmar reingreso')),
  });

  const pendingAction = confirmarSalida.isPending || confirmarReingreso.isPending;

  if (blocked) return null;

  return (
    <OrdenesTotPageFrame
      title={ORDENES_TOT_COPY.buscarOrdenes.title}
      description={ORDENES_TOT_COPY.buscarOrdenes.description}
    >
      <div
        data-testid="ot-porteria"
        className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3"
      >
        <section className="app-section-card min-w-0 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800">
            Vehículos
          </h3>
          {vehiculosQuery.isLoading && (
            <p className="text-sm text-gray-500">Cargando...</p>
          )}
          {vehiculosQuery.isError && (
            <OtQueryError
              message={getErrorMessage(
                vehiculosQuery.error,
                'Error al cargar vehículos de portería',
              )}
            />
          )}
          {(vehiculosQuery.data ?? []).map((item) => (
            <PorteriaCard
              key={`vh-${item.id}`}
              item={item}
              title={`PLACA: ${item.placa || '—'}`}
              accentClass={porteriaAccentVehiculos}
              buttonClass={btnSuccessClass}
              actionLabel="Confirmar Salida"
              pending={pendingAction}
              onAction={() => confirmarSalida.mutate(item.id)}
            />
          ))}
          {!vehiculosQuery.isLoading &&
            !vehiculosQuery.isError &&
            (vehiculosQuery.data ?? []).length === 0 && (
              <p className="text-sm text-gray-500">Sin vehículos pendientes</p>
            )}
        </section>

        <section className="app-section-card min-w-0 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800">TOT</h3>
          {totQuery.isLoading && <p className="text-sm text-gray-500">Cargando...</p>}
          {totQuery.isError && (
            <OtQueryError
              message={getErrorMessage(totQuery.error, 'Error al cargar TOT de portería')}
            />
          )}
          {(totQuery.data ?? []).map((item) => {
            const reingreso = Boolean(item.fechaSalida);
            return (
              <PorteriaCard
                key={`tot-${item.id}`}
                item={item}
                title={`PLACA: ${item.placa || '—'}`}
                accentClass={porteriaAccentTot}
                buttonClass={btnPrimaryClass}
                actionLabel={reingreso ? 'Confirmar Reingreso' : 'Confirmar Salida'}
                pending={pendingAction}
                onAction={() =>
                  reingreso
                    ? confirmarReingreso.mutate(item.id)
                    : confirmarSalida.mutate(item.id)
                }
                extraFields={
                  <>
                    <p>
                      PROVEEDOR: <strong>{item.proveedor || '—'}</strong>
                    </p>
                    <p>
                      CONTIENE: <strong>{item.contenido || '—'}</strong>
                    </p>
                  </>
                }
              />
            );
          })}
          {!totQuery.isLoading &&
            !totQuery.isError &&
            (totQuery.data ?? []).length === 0 && (
              <p className="text-sm text-gray-500">Sin TOT pendientes</p>
            )}
        </section>

        <section className="app-section-card min-w-0 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800">
            Órdenes Generales
          </h3>
          {ordenesQuery.isLoading && (
            <p className="text-sm text-gray-500">Cargando...</p>
          )}
          {ordenesQuery.isError && (
            <OtQueryError
              message={getErrorMessage(
                ordenesQuery.error,
                'Error al cargar órdenes generales de portería',
              )}
            />
          )}
          {(ordenesQuery.data ?? []).map((item) => (
            <PorteriaCard
              key={`og-${item.id}`}
              item={item}
              title={`SERIAL: ${item.placa || item.orden || '—'}`}
              accentClass={porteriaAccentGeneral}
              buttonClass={btnPrimaryClass}
              actionLabel="Confirmar Salida"
              pending={pendingAction}
              onAction={() => confirmarSalida.mutate(item.id)}
              extraFields={
                item.contenido ? (
                  <p>
                    DESCRIPCION: <strong>{item.contenido}</strong>
                  </p>
                ) : null
              }
            />
          ))}
          {!ordenesQuery.isLoading &&
            !ordenesQuery.isError &&
            (ordenesQuery.data ?? []).length === 0 && (
              <p className="text-sm text-gray-500">Sin órdenes generales pendientes</p>
            )}
        </section>
      </div>
    </OrdenesTotPageFrame>
  );
}
