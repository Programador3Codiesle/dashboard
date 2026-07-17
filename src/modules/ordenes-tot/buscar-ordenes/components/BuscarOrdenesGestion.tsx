'use client';

import type { ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  btnPrimaryClass,
  btnSuccessClass,
} from '@/modules/ordenes-tot/shared/constants/ui';
import {
  ordenesTotService,
  type PorteriaItem,
} from '@/modules/ordenes-tot/shared/services/ordenes-tot.service';

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
    <div className={`rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden ${accentClass}`}>
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-1 px-4 py-3 text-sm text-gray-700">
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
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();

  const vehiculosQuery = useQuery({
    queryKey: ['ordenes-tot', 'porteria', 'vehiculos'],
    queryFn: () => ordenesTotService.porteriaVehiculos(),
    refetchInterval: POLL_MS,
  });

  const totQuery = useQuery({
    queryKey: ['ordenes-tot', 'porteria', 'tot'],
    queryFn: () => ordenesTotService.porteriaTot(),
    refetchInterval: POLL_MS,
  });

  const ordenesQuery = useQuery({
    queryKey: ['ordenes-tot', 'porteria', 'ordenes-generales'],
    queryFn: () => ordenesTotService.porteriaOrdenesGenerales(),
    refetchInterval: POLL_MS,
  });

  const invalidatePorteria = () => {
    queryClient.invalidateQueries({ queryKey: ['ordenes-tot', 'porteria'] });
  };

  const confirmarSalida = useMutation({
    mutationFn: (id: number) => ordenesTotService.confirmarSalida(id),
    onSuccess: () => {
      showSuccess('Salida confirmada');
      invalidatePorteria();
    },
    onError: (e: Error) => showError(e.message),
  });

  const confirmarReingreso = useMutation({
    mutationFn: (id: number) => ordenesTotService.reingresoTot(id),
    onSuccess: () => {
      showSuccess('Reingreso confirmado');
      invalidatePorteria();
    },
    onError: (e: Error) => showError(e.message),
  });

  const pendingAction =
    confirmarSalida.isPending || confirmarReingreso.isPending;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800">
            Vehículos
          </h3>
          {vehiculosQuery.isLoading && (
            <p className="text-sm text-gray-500">Cargando...</p>
          )}
          {(vehiculosQuery.data ?? []).map((item) => (
            <PorteriaCard
              key={`vh-${item.id}`}
              item={item}
              title={`PLACA: ${item.placa || '—'}`}
              accentClass="border-l-4 border-l-amber-400"
              buttonClass={btnSuccessClass}
              actionLabel="Confirmar Salida"
              pending={pendingAction}
              onAction={() => confirmarSalida.mutate(item.id)}
            />
          ))}
          {!vehiculosQuery.isLoading && (vehiculosQuery.data ?? []).length === 0 && (
            <p className="text-sm text-gray-500">Sin vehículos pendientes</p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800">
            TOT
          </h3>
          {totQuery.isLoading && (
            <p className="text-sm text-gray-500">Cargando...</p>
          )}
          {(totQuery.data ?? []).map((item) => {
            const reingreso = Boolean(item.fechaSalida);
            return (
              <PorteriaCard
                key={`tot-${item.id}`}
                item={item}
                title={`PLACA: ${item.placa || '—'}`}
                accentClass="border-l-4 border-l-sky-400"
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
          {!totQuery.isLoading && (totQuery.data ?? []).length === 0 && (
            <p className="text-sm text-gray-500">Sin TOT pendientes</p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800">
            Órdenes Generales
          </h3>
          {ordenesQuery.isLoading && (
            <p className="text-sm text-gray-500">Cargando...</p>
          )}
          {(ordenesQuery.data ?? []).map((item) => (
            <PorteriaCard
              key={`og-${item.id}`}
              item={item}
              title={`SERIAL: ${item.placa || item.orden || '—'}`}
              accentClass="border-l-4 border-l-indigo-400"
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
          {!ordenesQuery.isLoading && (ordenesQuery.data ?? []).length === 0 && (
            <p className="text-sm text-gray-500">Sin órdenes generales pendientes</p>
          )}
        </section>
    </div>
  );
}
