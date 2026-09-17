'use client';

import { useState } from "react";
import Modal from "@/components/shared/ui/Modal";
import { SolicitudTiempoSuplementarioDTO } from "@/modules/administracion/types";
import { AREAS_SOLICITA, labelSede } from "@/modules/administracion/constants";
import { useSedesByEmpresa } from "@/modules/administracion/hooks/useSedesByEmpresa";
import { ChevronDown, Loader2 } from "lucide-react";
import { OptimizedInput } from "@/components/shared/ui/OptimizedInput";
import { OptimizedTextarea } from "@/components/shared/ui/OptimizedTextarea";
import { HoraMilitarSelect } from "@/components/administracion/forms/HoraMilitarSelect";
import { EmpleadoSearchCombobox } from "@/modules/informes/shared/components/EmpleadoSearchCombobox";
import { useEmpleadosInformesCombo } from "@/modules/informes/shared/hooks/useEmpleadosInformesCombo";
import {
  OPCIONES_HORA_EXTRA_FIN,
  OPCIONES_HORA_EXTRA_INI,
} from "@/modules/administracion/shared/utils/hora-militar";

const getInitialFormData = (fecha: string): SolicitudTiempoSuplementarioDTO => ({
  fechaInicio: fecha,
  horaInicio: "",
  horaFin: "",
  area: "",
  cargo: "",
  sede: "",
  descripcionMotivo: "",
  empleado: undefined,
});

interface SolicitudTiempoSuplementarioModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SolicitudTiempoSuplementarioDTO) => void;
  fechaSeleccionada: string;
  resetKey?: number;
  /** true mientras se guarda y se envía el correo (muestra loader en el botón) */
  saving?: boolean;
}

export default function SolicitudTiempoSuplementarioModal({
  open,
  onClose,
  onSave,
  fechaSeleccionada,
  resetKey = 0,
  saving = false,
}: SolicitudTiempoSuplementarioModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Solicitud Jornada Adicional" width="600px" maxWidthClassName="max-w-[95vw] sm:max-w-[90vw] md:max-w-[700px]">
      <SolicitudTiempoSuplementarioForm
        key={`${fechaSeleccionada}-${resetKey}`}
        onClose={onClose}
        onSave={onSave}
        fechaSeleccionada={fechaSeleccionada}
        saving={saving}
      />
    </Modal>
  );
}

function SolicitudTiempoSuplementarioForm({
  onClose,
  onSave,
  fechaSeleccionada,
  saving = false,
}: {
  onClose: () => void;
  onSave: (data: SolicitudTiempoSuplementarioDTO) => void;
  fechaSeleccionada: string;
  saving?: boolean;
}) {
  const { data: empleados = [], isPending: cargandoEmpleados } =
    useEmpleadosInformesCombo();
  const sedes = useSedesByEmpresa();
  const [formData, setFormData] = useState<SolicitudTiempoSuplementarioDTO>(() =>
    getInitialFormData(fechaSeleccionada),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "block w-full min-h-10 sm:min-h-11 border border-gray-300 rounded-xl px-3 py-2 sm:py-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm sm:text-base bg-white appearance-none pr-10";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const textareaClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-1">
      <div>
        <label className={labelClass} htmlFor="he-empleado">Empleado <span className="text-red-500">*</span></label>
        <div className="relative mt-1">
          <EmpleadoSearchCombobox
            id="he-empleado"
            name="empleado"
            empleados={empleados}
            value={formData.empleado != null ? String(formData.empleado) : ""}
            onChange={(nit) =>
              setFormData({
                ...formData,
                empleado: nit ? Number(nit) : undefined,
              })
            }
            cargando={cargandoEmpleados}
            required
            emptyOptionLabel={null}
            placeholder="Buscar por nombre..."
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="he-fecha">Fecha de inicio jornada adicional <span className="text-red-500">*</span></label>
        <input
          id="he-fecha"
          type="date"
          className={inputClass.replace("appearance-none pr-10", "")}
          value={formData.fechaInicio}
          onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
          required
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div className="app-form-grid-2">
        <div>
          <label className={labelClass} htmlFor="he-hora-ini">Hora de inicio jornada adicional <span className="text-red-500">*</span></label>
          <HoraMilitarSelect
            id="he-hora-ini"
            name="hora_ini"
            aria-label="Hora de inicio jornada adicional"
            className={inputClass}
            value={formData.horaInicio}
            onChange={(horaInicio) => setFormData({ ...formData, horaInicio })}
            opciones={OPCIONES_HORA_EXTRA_INI}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="he-hora-fin">Hora de finalización jornada adicional <span className="text-red-500">*</span></label>
          <HoraMilitarSelect
            id="he-hora-fin"
            name="hora_fin"
            aria-label="Hora de finalización jornada adicional"
            className={inputClass}
            value={formData.horaFin}
            onChange={(horaFin) => setFormData({ ...formData, horaFin })}
            opciones={OPCIONES_HORA_EXTRA_FIN}
            required
          />
        </div>
      </div>

      <div className="app-form-grid-2">
        <div>
          <label className={labelClass} htmlFor="he-area">Área donde labora <span className="text-red-500">*</span></label>
          <div className="relative mt-1">
            <select
              id="he-area"
              className={inputClass}
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              required
            >
              <option value="">Seleccione...</option>
              {AREAS_SOLICITA.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>
        <OptimizedInput
          label="Cargo del empleado"
          labelClassName={labelClass}
          className={inputClass.replace("appearance-none pr-10", "")}
          value={formData.cargo}
          onValueChange={(val) => setFormData({ ...formData, cargo: val })}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="he-sede">Sede <span className="text-red-500">*</span></label>
        <div className="relative mt-1">
          <select
            id="he-sede"
            className={inputClass}
            value={formData.sede}
            onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
            required
          >
            <option value="">Seleccione...</option>
            {sedes.map((sede) => (
              <option key={sede} value={sede}>{labelSede(sede)}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
        </div>
      </div>

      <OptimizedTextarea
        label="Describe el motivo de la solicitud"
        labelClassName={labelClass}
        className={textareaClass}
        rows={4}
        value={formData.descripcionMotivo}
        onValueChange={(val) => setFormData({ ...formData, descripcionMotivo: val })}
        required
      />

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-80 disabled:cursor-wait flex items-center justify-center gap-2 min-w-[120px]"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Enviando...
            </>
          ) : (
            "Guardar"
          )}
        </button>
      </div>
    </form>
  );
}
