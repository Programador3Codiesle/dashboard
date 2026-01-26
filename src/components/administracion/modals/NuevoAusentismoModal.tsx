'use client';

import { useState, useEffect } from "react";
import Modal from "@/components/shared/ui/Modal";
import { NuevoAusentismoDTO } from "@/modules/administracion/types";
import { SEDES, AREAS_SOLICITA } from "@/modules/administracion/constants";
import { ChevronDown } from "lucide-react";
import { OptimizedInput } from "@/components/shared/ui/OptimizedInput";
import { OptimizedTextarea } from "@/components/shared/ui/OptimizedTextarea";

interface NuevoAusentismoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NuevoAusentismoDTO) => void;
  fechaSeleccionada: string;
}

export default function NuevoAusentismoModal({
  open,
  onClose,
  onSave,
  fechaSeleccionada,
}: NuevoAusentismoModalProps) {
  const [formData, setFormData] = useState<NuevoAusentismoDTO>({
    fecha: fechaSeleccionada,
    horaInicio: "",
    horaFin: "",
    area: "",
    cargo: "",
    sede: "",
    motivo: "",
    descripcionMotivo: "",
  });

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({ ...prev, fecha: fechaSeleccionada }));
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
    <Modal open={open} onClose={onClose} title="Nuevo Ausentismo" width="600px">
      <div className="mb-4 p-3 brand-bg-light border border-[var(--color-primary)] rounded-lg">
        <p className="text-sm text-[var(--color-primary-dark)]">
          Los ausentismos solo se podrán diligenciar máximo por un día. Si desea tomar más de un día debe hacerlo por separado.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        <div>
          <label className={labelClass}>Fecha en la que se ausentará</label>
          <input
            type="date"
            className={inputClass.replace("appearance-none pr-10", "")}
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            required
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Hora Inicio Ausentismo <span className="text-red-500">*</span></label>
            <input
              type="time"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.horaInicio}
              onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Hora En Que Termina El Ausentismo <span className="text-red-500">*</span></label>
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

        <OptimizedInput
          label="Motivo del permiso"
          labelClassName={labelClass}
          className={inputClass.replace("appearance-none pr-10", "")}
          value={formData.motivo}
          onValueChange={(val) => setFormData({ ...formData, motivo: val })}
          required
        />

        <OptimizedTextarea
          label="Describe el motivo del permiso"
          labelClassName={labelClass}
          className={textareaClass}
          rows={4}
          value={formData.descripcionMotivo}
          onValueChange={(val) => setFormData({ ...formData, descripcionMotivo: val })}
          required
        />

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

