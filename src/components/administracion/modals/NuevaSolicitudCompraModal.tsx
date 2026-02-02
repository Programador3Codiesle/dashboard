'use client';

import { useRef, useState, useEffect, useCallback } from "react";
import React from "react";
import Modal from "@/components/shared/ui/Modal";
import { NuevaSolicitudCompraDTO, NivelUrgencia } from "@/modules/administracion/types";
import { AREAS_SOLICITA } from "@/modules/administracion/constants";
import { useSedesByEmpresa } from "@/modules/administracion/hooks/useSedesByEmpresa";
import { usuariosService } from "@/modules/usuarios/services/usuarios.service";
import type { IUsuario } from "@/modules/usuarios/types";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { ChevronDown } from "lucide-react";

interface NuevaSolicitudCompraModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NuevaSolicitudCompraDTO) => void;
}

/**
 * Modal con formulario no controlado (useRef) para evitar re-renders en cada tecla.
 * Solo se re-renderiza al abrir/cerrar, al cargar usuarios y al enviar.
 */
const NuevaSolicitudCompraModalComponent = ({
  open,
  onClose,
  onSave,
}: NuevaSolicitudCompraModalProps) => {
  const { user } = useAuth();
  const sedes = useSedesByEmpresa();
  const formRef = useRef<HTMLFormElement>(null);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);

  const nombreDefault = user?.nombre_usuario || user?.name || "";

  useEffect(() => {
    if (open && formRef.current) {
      formRef.current.reset();
      const nombreInput = formRef.current.elements.namedItem("nombrePersona") as HTMLInputElement | null;
      if (nombreInput) nombreInput.value = nombreDefault;
    }
  }, [open, nombreDefault]);

  useEffect(() => {
    if (open) {
      setCargandoUsuarios(true);
      usuariosService
        .getUsuarios()
        .then(setUsuarios)
        .catch(() => setUsuarios([]))
        .finally(() => setCargandoUsuarios(false));
    }
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const get = (name: string) =>
        (form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)?.value ?? "";
      const data: NuevaSolicitudCompraDTO = {
        areaSolicita: get("areaSolicita"),
        sede: get("sede"),
        nombrePersona: get("nombrePersona"),
        cargoPersona: get("cargoPersona"),
        gerenteAutoriza: get("gerenteAutoriza"),
        proveedoresSugeridos: get("proveedoresSugeridos"),
        nivelUrgencia: parseInt(get("urgencia") || "2", 10) as NivelUrgencia,
        areaCarga: get("areaCarga"),
        descripcion: get("descripcion"),
        fechaTentativa: get("fechaTentativa"),
      };
      onSave(data);
      onClose();
    },
    [onSave, onClose],
  );

  const inputClass =
    "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const textareaClass =
    "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";

  return (
    <Modal open={open} onClose={onClose} title="Nueva Solicitud de Compra" width="700px">
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Área que solicita la compra <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <select className={inputClass} name="areaSolicita" required>
                <option value="">Seleccione...</option>
                {AREAS_SOLICITA.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Seleccione la sede <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <select className={inputClass} name="sede" required>
                <option value="">Seleccione...</option>
                {sedes.map((sede) => (
                  <option key={sede} value={sede}>
                    {sede}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Nombre de la persona que realiza la solicitud</label>
            <input
              type="text"
              name="nombrePersona"
              className={inputClass.replace("appearance-none pr-10", "")}
              defaultValue={nombreDefault}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Cargo de la persona que está solicitando la compra</label>
            <input
              type="text"
              name="cargoPersona"
              className={inputClass.replace("appearance-none pr-10", "")}
              required
            />
          </div>

          <div>
            <label className={labelClass}>
              Nombre del gerente de área que autoriza la compra <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <select className={inputClass} name="gerenteAutoriza" required disabled={cargandoUsuarios}>
                <option value="">Seleccione...</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.nit}>
                    {u.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Proveedores o contratistas sugeridos</label>
            <input
              type="text"
              name="proveedoresSugeridos"
              className={inputClass.replace("appearance-none pr-10", "")}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Nivel de urgencia de la compra <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6 mt-2">
            {([1, 2, 3] as const).map((nivel) => (
              <label key={nivel} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="urgencia"
                  value={nivel}
                  defaultChecked={nivel === 2}
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
          <label className={labelClass}>
            Área y % a la que se debe cargar la compra <span className="text-red-500">*</span>
          </label>
          <textarea
            name="areaCarga"
            className={textareaClass}
            rows={3}
            placeholder="Ej: Administración 100%"
            required
          />
        </div>

        <div>
          <label className={labelClass}>
            Descripción de producto o servicio <span className="text-red-500">*</span>
          </label>
          <textarea
            name="descripcion"
            className={textareaClass}
            rows={4}
            placeholder="Describa el producto o servicio a solicitar..."
            required
          />
        </div>

        <div>
          <label className={labelClass}>
            Fecha tentativa <span className="text-red-500">*</span>
          </label>
          <input type="date" name="fechaTentativa" className={inputClass.replace("appearance-none pr-10", "")} required />
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
};

export default React.memo(NuevaSolicitudCompraModalComponent);
