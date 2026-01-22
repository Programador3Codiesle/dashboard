'use client';

import { useState, useEffect } from "react";
import Modal from "@/components/shared/ui/Modal";
import { NuevaSolicitudCompraDTO, NivelUrgencia } from "@/modules/administracion/types";
import { AREAS_SOLICITA, GERENTES_AUTORIZA, SEDES } from "@/modules/administracion/constants";
import { ChevronDown } from "lucide-react";

interface NuevaSolicitudCompraModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NuevaSolicitudCompraDTO) => void;
}

export default function NuevaSolicitudCompraModal({
  open,
  onClose,
  onSave,
}: NuevaSolicitudCompraModalProps) {
  const [formData, setFormData] = useState<NuevaSolicitudCompraDTO>({
    areaSolicita: "",
    sede: "",
    nombrePersona: "",
    cargoPersona: "",
    gerenteAutoriza: "",
    proveedoresSugeridos: "",
    nivelUrgencia: 2,
    areaCarga: "",
    descripcion: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        areaSolicita: "",
        sede: "",
        nombrePersona: "",
        cargoPersona: "",
        gerenteAutoriza: "",
        proveedoresSugeridos: "",
        nivelUrgencia: 2,
        areaCarga: "",
        descripcion: "",
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const textareaClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";

  return (
    <Modal open={open} onClose={onClose} title="Nueva Solicitud de Compra" width="700px">
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Área que solicita la compra <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <select
                className={inputClass}
                value={formData.areaSolicita}
                onChange={(e) => setFormData({ ...formData, areaSolicita: e.target.value })}
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
            <label className={labelClass}>Seleccione la sede <span className="text-red-500">*</span></label>
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
            <label className={labelClass}>Nombre de la persona que realiza la solicitud <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.nombrePersona}
              onChange={(e) => setFormData({ ...formData, nombrePersona: e.target.value })}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Cargo de la persona que está solicitando la compra <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.cargoPersona}
              onChange={(e) => setFormData({ ...formData, cargoPersona: e.target.value })}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Nombre del gerente de área que autoriza la compra <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <select
                className={inputClass}
                value={formData.gerenteAutoriza}
                onChange={(e) => setFormData({ ...formData, gerenteAutoriza: e.target.value })}
                required
              >
                <option value="">Seleccione...</option>
                {GERENTES_AUTORIZA.map((gerente) => (
                  <option key={gerente} value={gerente}>{gerente}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Proveedores o contratistas sugeridos</label>
            <input
              type="text"
              className={inputClass.replace("appearance-none pr-10", "")}
              value={formData.proveedoresSugeridos}
              onChange={(e) => setFormData({ ...formData, proveedoresSugeridos: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Nivel de urgencia de la compra <span className="text-red-500">*</span></label>
          <div className="flex gap-6 mt-2">
            {[1, 2, 3].map((nivel) => (
              <label key={nivel} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="urgencia"
                  value={nivel}
                  checked={formData.nivelUrgencia === nivel}
                  onChange={(e) => setFormData({ ...formData, nivelUrgencia: parseInt(e.target.value) as NivelUrgencia })}
                  className="w-5 h-5 brand-text focus:ring-[var(--color-primary)]"
                  required
                />
                <span className="text-sm font-medium">
                  Urgencia {nivel}
                  {nivel === 1 && <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Verde</span>}
                  {nivel === 2 && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Amarillo</span>}
                  {nivel === 3 && <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Rojo</span>}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>Área y % a la que se debe cargar la compra <span className="text-red-500">*</span></label>
          <textarea
            className={textareaClass}
            rows={3}
            value={formData.areaCarga}
            onChange={(e) => setFormData({ ...formData, areaCarga: e.target.value })}
            placeholder="Ej: Administración 100%"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Descripción de producto o servicio <span className="text-red-500">*</span></label>
          <textarea
            className={textareaClass}
            rows={4}
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Describa el producto o servicio a solicitar..."
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

