'use client';

import { useState, useEffect } from "react";
import Modal from "@/components/shared/ui/Modal";
import { RegistrarSalidaDTO, ModeloVehiculo } from "@/modules/administracion/types";
import { controlVehiculosService } from "@/modules/administracion/services/control-vehiculos.service";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/components/shared/ui/ToastContext";

interface RegistrarSalidaVehiculoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RegistrarSalidaDTO) => Promise<void>;
}

const TIPOS_VEHICULO = ["Otro", "Niñera", "Vehículo Remolcado"];
const TALLERES = ["Gasolina", "Diesel", "Accesorios", "Colision", "N/A"];

export default function RegistrarSalidaVehiculoModal({
  open,
  onClose,
  onSave,
}: RegistrarSalidaVehiculoModalProps) {
  const { showError } = useToast();
  const [formData, setFormData] = useState<RegistrarSalidaDTO>({
    placa: "",
    km_salida: 0,
    tipo_vehiculo: "",
    modelo: 0,
    taller: "",
    conductor: "",
    persona_autorizo: "",
    pasajeros: "",
    placa_vh_remolcado: "",
  });
  const [modelos, setModelos] = useState<ModeloVehiculo[]>([]);
  const [loadingModelos, setLoadingModelos] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Cargar modelos cuando se abre el modal
      loadModelos();
    } else {
      // Resetear formulario cuando se cierra
      setFormData({
        placa: "",
        km_salida: 0,
        tipo_vehiculo: "",
        modelo: 0,
        taller: "",
        conductor: "",
        persona_autorizo: "",
        pasajeros: "",
        placa_vh_remolcado: "",
      });
    }
  }, [open]);

  const loadModelos = async () => {
    setLoadingModelos(true);
    try {
      const modelosData = await controlVehiculosService.obtenerModelos();
      setModelos(modelosData);
    } catch (error: any) {
      showError(error.message || "Error al cargar los modelos");
    } finally {
      setLoadingModelos(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Error manejado por el componente padre
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const textareaClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";

  return (
    <Modal open={open} onClose={onClose} title="Registrar Salida" width="600px">
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Placa <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.placa}
              onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div>
            <label className={labelClass}>KM. Salida <span className="text-red-500">*</span></label>
            <input
              type="number"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.km_salida}
              onChange={(e) => setFormData({ ...formData, km_salida: parseInt(e.target.value) || 0 })}
              required
              min="0"
            />
          </div>

          <div>
            <label className={labelClass}>Tipo Vehículo <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <select
                className={inputClass}
                value={formData.tipo_vehiculo}
                onChange={(e) => setFormData({ ...formData, tipo_vehiculo: e.target.value })}
                required
              >
                <option value="">Seleccione...</option>
                {TIPOS_VEHICULO.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Modelo <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <select
                className={inputClass}
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: parseInt(e.target.value) || 0 })}
                required
                disabled={loadingModelos}
              >
                <option value="0">Seleccione...</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.descripcion}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              {loadingModelos && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  Cargando...
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Taller <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <select
                className={inputClass}
                value={formData.taller}
                onChange={(e) => setFormData({ ...formData, taller: e.target.value })}
                required
              >
                <option value="">Seleccione...</option>
                {TALLERES.map((taller) => (
                  <option key={taller} value={taller}>{taller}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          {formData.tipo_vehiculo === "Vehículo Remolcado" && (
            <div>
              <label className={labelClass}>Placa Vehículo Remolcado</label>
              <input
                type="text"
                className={inputClass.replace("appearance-none pr-10", "")}
                value={formData.placa_vh_remolcado || ""}
                onChange={(e) => setFormData({ ...formData, placa_vh_remolcado: e.target.value.toUpperCase() })}
              />
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Nombre de quien conduce el vehículo <span className="text-red-500">*</span></label>
          <input
            type="text"
            className={inputClass.replace("appearance-none pr-10", "")}
            value={formData.conductor}
            onChange={(e) => setFormData({ ...formData, conductor: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Quien autorizó <span className="text-red-500">*</span></label>
          <input
            type="text"
            className={inputClass.replace("appearance-none pr-10", "")}
            value={formData.persona_autorizo}
            onChange={(e) => setFormData({ ...formData, persona_autorizo: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Nombres empleados que van en el vehículo</label>
          <textarea
            className={textareaClass}
            rows={3}
            value={formData.pasajeros}
            onChange={(e) => setFormData({ ...formData, pasajeros: e.target.value })}
            placeholder="Liste los nombres de los empleados separados por comas..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
