'use client';

import { useState } from "react";
import Modal from "@/components/shared/ui/Modal";
import { RegistrarLlegadaDTO } from "@/modules/administracion/types";
import { Save } from "lucide-react";

interface RegistrarLlegadaModalProps {
  open: boolean;
  onClose: () => void;
  vehiculoId: number;
  placa: string;
  onSave: (id: number, data: RegistrarLlegadaDTO) => Promise<void>;
}

const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none text-sm bg-white";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const textareaClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none text-sm bg-white";

export default function RegistrarLlegadaModal({
  open,
  onClose,
  vehiculoId,
  placa,
  onSave,
}: RegistrarLlegadaModalProps) {
  const [kmLlegada, setKmLlegada] = useState("");
  const [observacion, setObservacion] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const km = Number(kmLlegada);
    if (!kmLlegada.trim() || Number.isNaN(km) || km <= 0) {
      setFormError("Debes ingresar un valor válido");
      return;
    }

    setLoading(true);
    try {
      await onSave(vehiculoId, {
        km_llegada: km,
        observacion,
      });
      onClose();
    } catch {
      // Error manejado por el componente padre
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar Llegada" width="500px">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Vehículo:</span> {placa}
        </p>

        {formError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {formError}
          </p>
        ) : null}

        <div>
          <label className={labelClass} htmlFor="km_llegada">
            KM Ingreso <span className="text-red-500">*</span>
          </label>
          <input
            id="km_llegada"
            type="number"
            className={inputClass}
            value={kmLlegada}
            onChange={(e) => setKmLlegada(e.target.value)}
            required
            min={1}
            placeholder="Kilometraje de llegada"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="observacion_llegada">Observación</label>
          <textarea
            id="observacion_llegada"
            className={textareaClass}
            rows={4}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Observación (opcional)"
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
            className="flex items-center gap-2 px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Save size={18} aria-hidden="true" />
            <span>{loading ? "Registrando..." : "Registrar"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
