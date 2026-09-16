'use client';

import { useState } from "react";
import Modal from "@/components/shared/ui/Modal";
import { RegistrarSalidaDTO, ModeloVehiculo } from "@/modules/administracion/types";
import { ChevronDown } from "lucide-react";
import { OptimizedInput } from "@/components/shared/ui/OptimizedInput";
import { OptimizedTextarea } from "@/components/shared/ui/OptimizedTextarea";

interface RegistrarSalidaVehiculoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RegistrarSalidaDTO) => Promise<void>;
  modelos: ModeloVehiculo[];
  loadingModelos?: boolean;
}

const TIPOS_VEHICULO = ["Niñera", "Vehículo Remolcado", "Otro"] as const;
const TALLERES = ["Gasolina", "Diesel", "Accesorios", "Colisión", "N/A"] as const;
const TIPO_REMOLCADO = "Vehículo Remolcado";
const MODELO_OTRA_MARCA = -1;

const emptyForm = {
  placa: "",
  km_salida: 0,
  tipo_vehiculo: "",
  modelo: "" as number | "",
  taller: "",
  conductor: "",
  persona_autorizo: "",
  pasajeros: "",
  placa_grua: "",
  otra_marca: "",
};

const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none text-sm bg-white appearance-none pr-10";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const textareaClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none text-sm bg-white";

export default function RegistrarSalidaVehiculoModal({
  open,
  onClose,
  onSave,
  modelos,
  loadingModelos = false,
}: RegistrarSalidaVehiculoModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const esRemolcado = formData.tipo_vehiculo === TIPO_REMOLCADO;
  const esOtraMarca = formData.modelo === MODELO_OTRA_MARCA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const personaAutorizo = formData.persona_autorizo.trim();
    if (!personaAutorizo) {
      setFormError('El campo "Quien Autorizó" es obligatorio');
      return;
    }

    const placa = formData.placa.trim().toUpperCase();
    if (placa.length > 6) {
      setFormError("El campo placa debe tener maximo de 6 caracteres");
      return;
    }

    if (formData.modelo === "") {
      setFormError("El campo modelo es obligatorio");
      return;
    }

    const placaGrua = formData.placa_grua.trim().toUpperCase();
    if (esRemolcado) {
      if (!placaGrua) {
        setFormError("El campo placa grua es requerido");
        return;
      }
      if (placaGrua.length > 6) {
        setFormError("El campo placa grua debe tener maximo de 6 caracteres");
        return;
      }
    }

    if (esOtraMarca && !formData.otra_marca.trim()) {
      setFormError("El campo marca del vehículo es obligatorio");
      return;
    }

    setLoading(true);
    try {
      await onSave({
        placa,
        km_salida: formData.km_salida,
        tipo_vehiculo: formData.tipo_vehiculo,
        modelo: formData.modelo,
        taller: formData.taller,
        conductor: formData.conductor,
        persona_autorizo: personaAutorizo,
        pasajeros: formData.pasajeros,
        placa_grua: esRemolcado ? placaGrua : undefined,
        otra_marca: esOtraMarca ? formData.otra_marca.trim() : undefined,
      });
      onClose();
    } catch {
      // Error manejado por el componente padre
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar Salida" width="600px">
      <form onSubmit={handleSubmit} className="space-y-5 p-1" autoComplete="off">
        {formError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="app-form-grid-2">
          <OptimizedInput
            label="Placa"
            labelClassName={labelClass}
            className={inputClass.replace("appearance-none pr-10", "")}
            value={formData.placa}
            onValueChange={(val) => setFormData({ ...formData, placa: val.toUpperCase() })}
            required
            maxLength={6}
            autoComplete="off"
          />

          <OptimizedInput
            label="KM. Salida"
            labelClassName={labelClass}
            type="number"
            className={inputClass.replace("appearance-none pr-10", "")}
            value={formData.km_salida.toString()}
            onValueChange={(val) => setFormData({ ...formData, km_salida: parseInt(val, 10) || 0 })}
            required
            min="0"
          />

          <div>
            <label className={labelClass} htmlFor="tipo_vehiculo">
              Tipo Vehículo <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <select
                id="tipo_vehiculo"
                className={inputClass}
                value={formData.tipo_vehiculo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipo_vehiculo: e.target.value,
                    placa_grua: e.target.value === TIPO_REMOLCADO ? formData.placa_grua : "",
                  })
                }
                required
              >
                <option value="">Seleccione un tipo de vehículo</option>
                {TIPOS_VEHICULO.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} aria-hidden="true" />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="modelo_vehiculo">
              Modelo <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <select
                id="modelo_vehiculo"
                className={inputClass}
                value={formData.modelo === "" ? "" : String(formData.modelo)}
                onChange={(e) => {
                  const raw = e.target.value;
                  const modelo = raw === "" ? "" : parseInt(raw, 10);
                  setFormData({
                    ...formData,
                    modelo,
                    otra_marca: modelo === MODELO_OTRA_MARCA ? formData.otra_marca : "",
                  });
                }}
                required
                disabled={loadingModelos}
              >
                <option value="">Seleccione un tipo de vehículo</option>
                <option value={MODELO_OTRA_MARCA}>Otra Marca</option>
                {modelos.map((modelo) => (
                  <option key={modelo.id} value={modelo.id}>
                    {modelo.descripcion}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} aria-hidden="true" />
              {loadingModelos ? (
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                  Cargando...
                </div>
              ) : null}
            </div>
          </div>

          {esOtraMarca ? (
            <div className="col-span-2">
              <OptimizedInput
                label="Marca del Vehículo"
                labelClassName={labelClass}
                className={inputClass.replace("appearance-none pr-10", "")}
                value={formData.otra_marca}
                onValueChange={(val) => setFormData({ ...formData, otra_marca: val })}
                required
                autoComplete="off"
              />
            </div>
          ) : null}

          {esRemolcado ? (
            <OptimizedInput
              label="Placa Grúa"
              labelClassName={labelClass}
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.placa_grua}
              onValueChange={(val) => setFormData({ ...formData, placa_grua: val.toUpperCase() })}
              required
              maxLength={6}
              autoComplete="off"
            />
          ) : null}

          <div>
            <label className={labelClass} htmlFor="taller_vehiculo">
              Talleres <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <select
                id="taller_vehiculo"
                className={inputClass}
                value={formData.taller}
                onChange={(e) => setFormData({ ...formData, taller: e.target.value })}
                required
              >
                <option value="">Seleccione un tipo de vehículo</option>
                {TALLERES.map((taller) => (
                  <option key={taller} value={taller}>{taller}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} aria-hidden="true" />
            </div>
          </div>

          <OptimizedInput
            label="Nombre de quien conduce el vehículo"
            labelClassName={labelClass}
            className={inputClass.replace("appearance-none pr-10", "")}
            value={formData.conductor}
            onValueChange={(val) => setFormData({ ...formData, conductor: val })}
            required
            autoComplete="off"
          />
        </div>

        <OptimizedInput
          label="Quien Autorizó"
          labelClassName={labelClass}
          className={inputClass.replace("appearance-none pr-10", "")}
          value={formData.persona_autorizo}
          onValueChange={(val) => setFormData({ ...formData, persona_autorizo: val })}
          required
          autoComplete="off"
        />

        <OptimizedTextarea
          label="Nombres empleados que van en el vehículo"
          labelClassName={labelClass}
          className={textareaClass}
          rows={3}
          value={formData.pasajeros}
          onValueChange={(val) => setFormData({ ...formData, pasajeros: val })}
        />

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
            className="px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
