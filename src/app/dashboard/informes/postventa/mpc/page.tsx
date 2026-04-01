'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mpcService, MpcRow } from '@/modules/informes/postventa/services/mpc.service';
import { useToast } from '@/components/shared/ui/ToastContext';

export default function MpcInformePage() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();

  const { data, isLoading } = useQuery<MpcRow[], Error>({
    queryKey: ['mpc-informe'],
    queryFn: () => mpcService.listar(),
  });

  const [updatingPlaca, setUpdatingPlaca] = useState<string | null>(null);

  const cambiarEstadoMutation = useMutation<
    void,
    Error,
    { placa: string; estado: number }
  >({
    mutationFn: async ({ placa, estado }) => {
      setUpdatingPlaca(placa);
      await mpcService.cambiarEstadoCasoEspecial(placa, estado);
    },
    onSuccess: () => {
      showSuccess('Estado de caso especial actualizado.');
      queryClient.invalidateQueries({ queryKey: ['mpc-informe'] });
    },
    onError: () => {
      showError('No se pudo actualizar el estado del caso especial.');
    },
    onSettled: () => {
      setUpdatingPlaca(null);
    },
  });

  const handleToggleCasoEspecial = (row: MpcRow) => {
    const nuevoEstado = row.estadoCasoEspecial === 1 ? 0 : 1;
    cambiarEstadoMutation.mutate({ placa: row.placa, estado: nuevoEstado });
  };

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">
            Informe Mantenimiento Prepagado (MPC)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Detalle de planes de mantenimiento prepagado, valores redimidos, saldo y casos especiales.
          </p>
        </div>
        <div className="text-xs text-gray-500">
          {isLoading ? 'Cargando...' : `Total registros: ${rows.length}`}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border overflow-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-[--color-primary] text-white">
            <tr>
              <th className="px-2 py-2 text-left">Fecha registro</th>
              <th className="px-2 py-2 text-left">Placa</th>
              <th className="px-2 py-2 text-left">Modelo</th>
              <th className="px-2 py-2 text-left">Plan vendido</th>
              <th className="px-2 py-2 text-right">Valor MPC</th>
              <th className="px-2 py-2 text-right">Valor redimido</th>
              <th className="px-2 py-2 text-right">Saldo</th>
              <th className="px-2 py-2 text-left">Vendido por</th>
              <th className="px-2 py-2 text-center">Caso especial</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const saldo = row.saldoMpc;
              const isNA = saldo <= 0;
              const isChecked = row.estadoCasoEspecial === 1;
              const disabled = updatingPlaca === row.placa || isNA;

              return (
                <tr key={row.placa} className="border-b last:border-b-0">
                  <td className="px-2 py-1">{row.fechaRegistro}</td>
                  <td className="px-2 py-1">{row.placa}</td>
                  <td className="px-2 py-1">{row.desModelo}</td>
                  <td className="px-2 py-1">{row.planVendido}</td>
                  <td className="px-2 py-1 text-right">
                    {row.valorMpc.toLocaleString('es-CO')}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {row.valorRedimido.toLocaleString('es-CO')}
                  </td>
                  <td className="px-2 py-1 text-right">
                    {saldo.toLocaleString('es-CO')}
                  </td>
                  <td className="px-2 py-1">{row.vendidoPor}</td>
                  <td className="px-2 py-1 text-center">
                    {isNA ? (
                      <span className="text-[11px] text-gray-500">N/A</span>
                    ) : (
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[--color-primary]"
                        checked={isChecked}
                        disabled={disabled}
                        onChange={() => handleToggleCasoEspecial(row)}
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={9}>
                  No hay registros para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

