'use client';

import { useState, useEffect } from "react";
import Modal from "@/components/shared/ui/Modal";
import { ValoresCruce, ActualizarValoresCruceDTO } from "@/modules/administracion/types";
import { Save } from "lucide-react";

interface ValoresCruceModalProps {
  open: boolean;
  onClose: () => void;
  valoresCruce: ValoresCruce | null;
  tipo: string;
  numero: number;
  onSave: (data: ActualizarValoresCruceDTO) => Promise<void>;
}

export default function ValoresCruceModal({
  open,
  onClose,
  valoresCruce,
  tipo,
  numero,
  onSave,
}: ValoresCruceModalProps) {
  const [valor, setValor] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (valoresCruce && valoresCruce.valor !== null) {
      setValor(valoresCruce.valor);
    } else {
      setValor(0);
    }
  }, [valoresCruce, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ valor_aplicado2: valor });
      onClose();
    } catch (error) {
      // Error manejado por el componente padre
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  if (!valoresCruce) return null;

  return (
    <Modal open={open} onClose={onClose} title="Actualización Valor Cruce" width="600px">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[var(--color-primary)] bg-gray-50">
                <th className="text-left py-3 px-4 font-bold text-gray-900">Tipo</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Número</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Tipo Aplica</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Número Aplica</th>
                <th className="text-left py-3 px-4 font-bold text-gray-900">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">{valoresCruce.tipo}</td>
                <td className="py-3 px-4">{valoresCruce.numero}</td>
                <td className="py-3 px-4">{valoresCruce.tipo_cruce}</td>
                <td className="py-3 px-4">{valoresCruce.numero_cruce}</td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    className={inputClass}
                    value={valor}
                    onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                    required
                  />
                </td>
              </tr>
            </tbody>
          </table>
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
            className="flex items-center gap-2 px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <Save size={18} />
            <span>{loading ? "Guardando..." : "Guardar"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

