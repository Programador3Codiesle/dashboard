'use client';

import { useState, useEffect } from "react";
import Modal from "@/components/shared/ui/Modal";
import { SolicitudTiempoSuplementarioDTO } from "@/modules/administracion/types";
import { SEDES, AREAS_SOLICITA } from "@/modules/administracion/constants";
import { ChevronDown } from "lucide-react";

interface SolicitudTiempoSuplementarioModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: SolicitudTiempoSuplementarioDTO) => void;
  fechaSeleccionada: string;
}

export default function SolicitudTiempoSuplementarioModal({
  open,
  onClose,
  onSave,
  fechaSeleccionada,
}: SolicitudTiempoSuplementarioModalProps) {
  const [formData, setFormData] = useState<SolicitudTiempoSuplementarioDTO>({
    fechaInicio: fechaSeleccionada,
    horaInicio: "",
    horaFin: "",
    area: "",
    cargo: "",
    sede: "",
    empleado: "",
    descripcionMotivo: "",
  });

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({ ...prev, fechaInicio: fechaSeleccionada }));
    }
  }, [open, fechaSeleccionada]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const textareaClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";

  return (
    <Modal open={open} onClose={onClose} title="Solicitud Jornada Adicional" width="600px">
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        <div>
          <label className={labelClass}>Fecha de inicio jornada adicional <span className="text-red-500">*</span></label>
          <input
            type="date"
            className={inputClass.replace("appearance-none pr-10", "")}
            value={formData.fechaInicio}
            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Hora de inicio jornada adicional <span className="text-red-500">*</span></label>
            <input
              type="time"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.horaInicio}
              onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Hora de finalización jornada adicional <span className="text-red-500">*</span></label>
            <input
              type="time"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.horaFin}
              onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Área donde labora <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <select
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
          <div>
            <label className={labelClass}>Cargo del empleado <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sede <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <select
                className={inputClass}
                value={formData.sede}
                onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
                required
              >
                <option value="">Seleccione...</option>
                {SEDES.map((sede) => (
                  <option key={sede} value={sede}>{sede}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Empleado <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.empleado}
              onChange={(e) => setFormData({ ...formData, empleado: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Describe el motivo de la solicitud <span className="text-red-500">*</span></label>
          <textarea
            className={textareaClass}
            rows={4}
            value={formData.descripcionMotivo}
            onChange={(e) => setFormData({ ...formData, descripcionMotivo: e.target.value })}
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}

