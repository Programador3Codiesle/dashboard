'use client';

import { useState, useEffect } from "react";
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

export default function RegistrarLlegadaModal({
  open,
  onClose,
  vehiculoId,
  placa,
  onSave,
}: RegistrarLlegadaModalProps) {
  const [formData, setFormData] = useState<RegistrarLlegadaDTO>({
    km_llegada: 0,
    observacion: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData({
        km_llegada: 0,
        observacion: "",
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(vehiculoId, formData);
      onClose();
    } catch (error) {
      // Error manejado por el componente padre
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const textareaClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all text-sm bg-white";

  return (
    <Modal open={open} onClose={onClose} title="Registrar Llegada" width="500px">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Vehículo:</span> {placa}
          </p>
        </div>

        <div>
          <label className={labelClass}>
            KM Ingreso <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className={inputClass}
            value={formData.km_llegada}
            onChange={(e) => setFormData({ ...formData, km_llegada: parseFloat(e.target.value) || 0 })}
            required
            min="0"
          />
        </div>

        <div>
          <label className={labelClass}>Observación</label>
          <textarea
            className={textareaClass}
            rows={4}
            value={formData.observacion}
            onChange={(e) => setFormData({ ...formData, observacion: e.target.value })}
            placeholder="Ingrese observaciones sobre la llegada del vehículo..."
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
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Save size={18} />
            <span>{loading ? "Registrando..." : "Registrar Llegada"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

