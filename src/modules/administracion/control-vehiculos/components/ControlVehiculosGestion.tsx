'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Plus, Search } from 'lucide-react';
import RegistrarLlegadaModal from '@/components/administracion/modals/RegistrarLlegadaModal';
import RegistrarSalidaVehiculoModal from '@/components/administracion/modals/RegistrarSalidaVehiculoModal';
import { Pagination } from '@/components/shared/ui/Pagination';
import { OptimizedInput } from '@/components/shared/ui/OptimizedInput';
import { usePagination } from '@/components/shared/ui/hooks/usePagination';
import { useToast } from '@/components/shared/ui/ToastContext';
import {
  catalogQueryOptions,
  transactionalQueryOptions,
} from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { controlVehiculosService } from '@/modules/administracion/services/control-vehiculos.service';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import type {
  RegistrarLlegadaDTO,
  RegistrarSalidaDTO,
  VehiculoSalida,
  VehiculoSalidaAPI,
} from '@/modules/administracion/types';
import { CONTROL_VEHICULOS_SUBMENU_ID } from '@/utils/constants';

function mapRegistroToVehiculo(item: VehiculoSalidaAPI): VehiculoSalida {
  return {
    id: item.id,
    placa: item.placa,
    fechaSalida: item.fecha_salida,
    horaSalida: item.hora_salida,
    kmSalida: item.km_salida,
    tipoVehiculo: item.tipo_vehiculo,
    modelo: item.modelo,
    conductor: item.conductor,
    pasajeros: item.pasajeros || '',
    quienAutorizo: item.persona_autorizo,
    vehiculoRemolcado:
      item.placa_vh_remolcado !== null && item.placa_vh_remolcado !== '',
    taller: item.taller,
    empresaNombre: item.empresa_nombre,
    fechaIngreso: item.fecha_llegada || undefined,
    horaIngreso: item.hora_llegada || undefined,
    kmIngreso: item.km_llegada || undefined,
    observacion: item.observacion || undefined,
  };
}

export function ControlVehiculosGestion() {
  const { user, blocked } = useAdministracionPageGuard(
    CONTROL_VEHICULOS_SUBMENU_ID,
  );
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;
  const puedeVerObservacion =
    user?.perfil_postventa === '1' || user?.perfil_postventa === '20';
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLlegadaOpen, setModalLlegadaOpen] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] =
    useState<VehiculoSalida | null>(null);

  const query = useQuery({
    queryKey: administracionKeys.controlVehiculos,
    queryFn: async () => {
      const data = await controlVehiculosService.listarRegistros();
      return data.map(mapRegistroToVehiculo);
    },
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const modelosQuery = useQuery({
    queryKey: administracionKeys.modelosVehiculo,
    queryFn: () => controlVehiculosService.obtenerModelos(),
    enabled: sesionLista && modalOpen,
    ...catalogQueryOptions,
  });

  const filtered = useMemo(() => {
    const vehiculos = query.data ?? [];
    if (!search.trim()) return vehiculos;
    const searchLower = search.toLowerCase();
    return vehiculos.filter(
      (item) =>
        item.placa.toLowerCase().includes(searchLower) ||
        item.conductor.toLowerCase().includes(searchLower) ||
        item.taller.toLowerCase().includes(searchLower) ||
        item.empresaNombre.toLowerCase().includes(searchLower),
    );
  }, [search, query.data]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } =
    usePagination(filtered.length, 10);

  const vehiculosMostrados = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex],
  );

  const salidaMutation = useMutation({
    mutationFn: (data: RegistrarSalidaDTO) =>
      controlVehiculosService.registrarSalida(data),
    onSuccess: async () => {
      showSuccess('Salida registrada correctamente');
      await queryClient.invalidateQueries({
        queryKey: administracionKeys.controlVehiculos,
      });
    },
    onError: (error) => {
      showError(getErrorMessage(error, 'Error al registrar la salida'));
    },
  });

  const llegadaMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: RegistrarLlegadaDTO;
    }) => controlVehiculosService.registrarLlegada(id, data),
    onSuccess: async () => {
      showSuccess('Llegada registrada correctamente');
      setModalLlegadaOpen(false);
      setVehiculoSeleccionado(null);
      await queryClient.invalidateQueries({
        queryKey: administracionKeys.controlVehiculos,
      });
    },
    onError: (error) => {
      showError(getErrorMessage(error, 'Error al registrar la llegada'));
    },
  });

  const handleSave = async (data: RegistrarSalidaDTO) => {
    await salidaMutation.mutateAsync(data);
  };

  const handleRegistrarLlegada = (vehiculo: VehiculoSalida) => {
    setVehiculoSeleccionado(vehiculo);
    setModalLlegadaOpen(true);
  };

  const handleGuardarLlegada = async (
    id: number,
    data: RegistrarLlegadaDTO,
  ) => {
    await llegadaMutation.mutateAsync({ id, data });
  };

  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.controlVehiculos.title}
      description={ADMINISTRACION_COPY.controlVehiculos.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.controlVehiculos.loadError,
          )}
        />
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl brand-bg px-4 py-2.5 font-medium text-white shadow-md transition-colors hover:opacity-90 hover:shadow-lg"
        >
          <Plus size={18} />
          <span>Registrar Salida</span>
        </button>
      </div>

      <div className="relative">
        <Search
          className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <OptimizedInput
          placeholder="Buscar por placa, conductor o taller..."
          className="w-full rounded-xl border border-gray-300 py-2.5 pr-4 pl-10 outline-none transition-all focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary)"
          value={search}
          onValueChange={(val) => setSearch(val)}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
      >
        {query.isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Cargando registros...
          </div>
        ) : (
          <>
            <div>
              <table className="w-full table-fixed">
                <thead className="border-b border-gray-200 bg-gray-50 text-xs">
                  <tr>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Placa
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Empresa
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Fecha Salida
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Hora Salida
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      KM. Salida
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Tipo Vehículo
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Modelo
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Conductor
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Pasajeros
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Quien Autorizó
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Vehículo Remolcado
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Taller
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Fecha Ingreso
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Hora Ingreso
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      KM Ingreso
                    </th>
                    <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                      Registrar Llegada
                    </th>
                    {puedeVerObservacion ? (
                      <th className="wrap-break-word px-2 py-3 text-left font-semibold text-gray-700">
                        Observación
                      </th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {vehiculosMostrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={puedeVerObservacion ? 16 : 15}
                        className="py-10 text-center text-gray-500"
                      >
                        No se encontraron registros
                      </td>
                    </tr>
                  ) : (
                    vehiculosMostrados.map((vehiculo) => (
                      <tr
                        key={vehiculo.id}
                        className="align-top border-b border-gray-100 text-xs hover:bg-gray-50"
                      >
                        <td className="wrap-break-word px-2 py-3 font-semibold brand-text">
                          {vehiculo.placa}
                        </td>
                        <td className="wrap-break-word px-2 py-3 font-medium text-gray-900">
                          {vehiculo.empresaNombre}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.fechaSalida}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.horaSalida}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.kmSalida.toLocaleString()}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.tipoVehiculo}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.modelo}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.conductor}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.pasajeros || '-'}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.quienAutorizo}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.vehiculoRemolcado ? (
                            <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                              Sí
                            </span>
                          ) : (
                            <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                              No
                            </span>
                          )}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.taller}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.fechaIngreso || '-'}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.horaIngreso || '-'}
                        </td>
                        <td className="wrap-break-word px-2 py-3">
                          {vehiculo.kmIngreso?.toLocaleString() || '-'}
                        </td>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() => handleRegistrarLlegada(vehiculo)}
                            className="inline-flex items-center gap-1 rounded-full border border-(--color-primary-dark) brand-bg px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-95"
                          >
                            <CheckCircle2 size={14} className="text-white" />
                            Reg.
                          </button>
                        </td>
                        {puedeVerObservacion ? (
                          <td className="wrap-break-word px-2 py-3 text-xs">
                            {vehiculo.observacion || '-'}
                          </td>
                        ) : null}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 ? (
              <div className="border-t border-gray-200 p-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChange={changePage}
                />
              </div>
            ) : null}
          </>
        )}
      </motion.div>

      <RegistrarSalidaVehiculoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        modelos={modelosQuery.data ?? []}
        loadingModelos={modelosQuery.isLoading}
      />

      {vehiculoSeleccionado ? (
        <RegistrarLlegadaModal
          open={modalLlegadaOpen}
          onClose={() => {
            setModalLlegadaOpen(false);
            setVehiculoSeleccionado(null);
          }}
          vehiculoId={vehiculoSeleccionado.id}
          placa={vehiculoSeleccionado.placa}
          onSave={handleGuardarLlegada}
        />
      ) : null}
    </AdministracionPageFrame>
  );
}
