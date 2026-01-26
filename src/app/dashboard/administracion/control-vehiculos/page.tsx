'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Plus, CheckCircle2 } from "lucide-react";
import { OptimizedInput } from "@/components/shared/ui/OptimizedInput";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { VehiculoSalida, RegistrarSalidaDTO, RegistrarLlegadaDTO, VehiculoSalidaAPI } from "@/modules/administracion/types";
import { controlVehiculosService } from "@/modules/administracion/services/control-vehiculos.service";
import RegistrarSalidaVehiculoModal from "@/components/administracion/modals/RegistrarSalidaVehiculoModal";
import RegistrarLlegadaModal from "@/components/administracion/modals/RegistrarLlegadaModal";
import { useToast } from "@/components/shared/ui/ToastContext";

export default function ControlVehiculosPage() {
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLlegadaOpen, setModalLlegadaOpen] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<VehiculoSalida | null>(null);
  const [vehiculos, setVehiculos] = useState<VehiculoSalida[]>([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadRegistros = useCallback(async () => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController para esta petición
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    try {
      const data = await controlVehiculosService.listarRegistros();
      // Mapear datos de la API al formato del frontend
      const vehiculosMapeados: VehiculoSalida[] = data.map((item: VehiculoSalidaAPI) => ({
        id: item.id,
        placa: item.placa,
        fechaSalida: item.fecha_salida,
        horaSalida: item.hora_salida,
        kmSalida: item.km_salida,
        tipoVehiculo: item.tipo_vehiculo,
        modelo: item.modelo,
        conductor: item.conductor,
        pasajeros: item.pasajeros || "",
        quienAutorizo: item.persona_autorizo,
        vehiculoRemolcado: item.placa_vh_remolcado !== null && item.placa_vh_remolcado !== "",
        taller: item.taller,
        empresaNombre: item.empresa_nombre,
        fechaIngreso: item.fecha_llegada || undefined,
        horaIngreso: item.hora_llegada || undefined,
        kmIngreso: item.km_llegada || undefined,
        observacion: item.observacion || undefined,
      }));

      // Solo actualizar estado si el componente sigue montado y no se canceló la petición
      if (mountedRef.current && !abortController.signal.aborted) {
        setVehiculos(vehiculosMapeados);
      }
    } catch (error: any) {
      // Ignorar errores de cancelación
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      if (mountedRef.current && !abortController.signal.aborted) {
        showError(error.message || "Error al cargar los registros de vehículos");
      }
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Cargar registros al montar el componente
  useEffect(() => {
    mountedRef.current = true;
    loadRegistros();

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadRegistros]);

  const filtered = useMemo(() => {
    if (!search.trim()) return vehiculos;
    const searchLower = search.toLowerCase();
    return vehiculos.filter(
      (item) =>
        item.placa.toLowerCase().includes(searchLower) ||
        item.conductor.toLowerCase().includes(searchLower) ||
        item.taller.toLowerCase().includes(searchLower) ||
        item.empresaNombre.toLowerCase().includes(searchLower)
    );
  }, [search, vehiculos]);

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(filtered.length, 10);

  const vehiculosMostrados = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex]
  );

  const handleSave = async (data: RegistrarSalidaDTO) => {
    try {
      const resultado = await controlVehiculosService.registrarSalida(data);
      // Mapear el resultado y agregarlo a la lista
      const nuevaSalida: VehiculoSalida = {
        id: resultado.id,
        placa: resultado.placa,
        fechaSalida: resultado.fecha_salida,
        horaSalida: resultado.hora_salida,
        kmSalida: resultado.km_salida,
        tipoVehiculo: resultado.tipo_vehiculo,
        modelo: resultado.modelo,
        conductor: resultado.conductor,
        pasajeros: resultado.pasajeros || "",
        quienAutorizo: resultado.persona_autorizo,
        vehiculoRemolcado: resultado.placa_vh_remolcado !== null && resultado.placa_vh_remolcado !== "",
        taller: resultado.taller,
        empresaNombre: resultado.empresa_nombre,
        fechaIngreso: resultado.fecha_llegada || undefined,
        horaIngreso: resultado.hora_llegada || undefined,
        kmIngreso: resultado.km_llegada || undefined,
        observacion: resultado.observacion || undefined,
      };
      setVehiculos([nuevaSalida, ...vehiculos]);
      showSuccess("Salida registrada correctamente");
    } catch (error: any) {
      showError(error.message || "Error al registrar la salida");
      throw error;
    }
  };

  const handleRegistrarLlegada = (vehiculo: VehiculoSalida) => {
    setVehiculoSeleccionado(vehiculo);
    setModalLlegadaOpen(true);
  };

  const handleGuardarLlegada = async (id: number, data: RegistrarLlegadaDTO) => {
    try {
      const resultado = await controlVehiculosService.registrarLlegada(id, data);
      // Actualizar el vehículo en la lista
      const vehiculosActualizados = vehiculos.map((v) =>
        v.id === id
          ? {
            ...v,
            fechaIngreso: resultado.fecha_llegada || undefined,
            horaIngreso: resultado.hora_llegada || undefined,
            kmIngreso: resultado.km_llegada || undefined,
            observacion: resultado.observacion || undefined,
          }
          : v
      );
      setVehiculos(vehiculosActualizados);
      showSuccess("Llegada registrada correctamente");
      setModalLlegadaOpen(false);
      setVehiculoSeleccionado(null);
    } catch (error: any) {
      showError(error.message || "Error al registrar la llegada");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">Control Ingreso y Salida de Vehículos</h1>
          <p className="text-gray-500 mt-1">Registro y control de ingresos y salidas de vehículos multimarca</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
        >
          <Plus size={18} />
          <span>Registrar Salida</span>
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <OptimizedInput
          placeholder="Buscar por placa, conductor o taller..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all"
          value={search}
          onValueChange={(val) => setSearch(val)}
        />
      </div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {loading && (
          <div className="p-8 text-center text-gray-500">
            Cargando registros...
          </div>
        )}
        {!loading && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 text-sm">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Placa</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Empresa</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha Salida</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Hora Salida</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">KM. Salida</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Tipo Vehículo</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Modelo</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Conductor</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Pasajeros</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Quien Autorizó</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Vehículo Remolcado</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Taller</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha Ingreso</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Hora Ingreso</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">KM Ingreso</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Registrar Llegada</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculosMostrados.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="text-center py-10 text-gray-500">
                        No se encontraron registros
                      </td>
                    </tr>
                  ) : (
                    vehiculosMostrados.map((vehiculo) => (
                      <tr key={vehiculo.id} className="border-b border-gray-100 hover:bg-gray-50 text-sm">
                        <td className="py-4 px-6 font-semibold brand-text">{vehiculo.placa}</td>
                        <td className="py-4 px-6 font-medium text-gray-900">{vehiculo.empresaNombre}</td>
                        <td className="py-4 px-6">{vehiculo.fechaSalida}</td>
                        <td className="py-4 px-6">{vehiculo.horaSalida}</td>
                        <td className="py-4 px-6">{vehiculo.kmSalida.toLocaleString()}</td>
                        <td className="py-4 px-6">{vehiculo.tipoVehiculo}</td>
                        <td className="py-4 px-6">{vehiculo.modelo}</td>
                        <td className="py-4 px-6">{vehiculo.conductor}</td>
                        <td className="py-4 px-6 text-sm">{vehiculo.pasajeros || "-"}</td>
                        <td className="py-4 px-6">{vehiculo.quienAutorizo}</td>
                        <td className="py-4 px-6">
                          {vehiculo.vehiculoRemolcado ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Sí</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">No</span>
                          )}
                        </td>
                        <td className="py-4 px-6">{vehiculo.taller}</td>
                        <td className="py-4 px-6">{vehiculo.fechaIngreso || "-"}</td>
                        <td className="py-4 px-6">{vehiculo.horaIngreso || "-"}</td>
                        <td className="py-4 px-6">{vehiculo.kmIngreso?.toLocaleString() || "-"}</td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleRegistrarLlegada(vehiculo)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold brand-bg brand-bg-hover text-white border border-[var(--color-primary-dark)] shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                          >
                            <CheckCircle2 size={14} className="text-white" />
                            Registrar
                          </button>
                        </td>
                        <td className="py-4 px-6 text-sm">{vehiculo.observacion || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <Pagination currentPage={currentPage} totalPages={totalPages} onChange={changePage} />
              </div>
            )}
          </>
        )}
      </motion.div>

      <RegistrarSalidaVehiculoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {vehiculoSeleccionado && (
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
      )}
    </div>
  );
}
