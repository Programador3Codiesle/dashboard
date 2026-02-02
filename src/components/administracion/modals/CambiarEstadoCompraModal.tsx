'use client';

import { useState } from "react";
import Modal from "@/components/shared/ui/Modal";
import { gestionComprasService } from "@/modules/administracion/services/gestion-compras.service";
import { useToast } from "@/components/shared/ui/ToastContext";

interface CambiarEstadoCompraModalProps {
  open: boolean;
  onClose: () => void;
  solicitudId: number;
  estadoActual: number;
  onSuccess: () => void;
}

const ESTADOS = [
  { value: 2, label: "En Proceso" },
  { value: 3, label: "En Tránsito" },
  { value: 4, label: "Despachada" },
  { value: 5, label: "Negada" },
];

export default function CambiarEstadoCompraModal({
  open,
  onClose,
  solicitudId,
  estadoActual,
  onSuccess,
}: CambiarEstadoCompraModalProps) {
  const [estado, setEstado] = useState<number>(estadoActual);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (estado === estadoActual) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const result = await gestionComprasService.cambiarEstado(solicitudId, estado);
      if (result.status) {
        showSuccess(result.message);
        onSuccess();
        onClose();
      } else {
        showError(result.message || "Error al cambiar el estado");
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      showError("Error al cambiar el estado de la compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cambiar Estado">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccione un estado
          </label>
          <select
            value={estado}
            onChange={(e) => setEstado(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
            disabled={loading}
          >
            <option value={estadoActual}>Estado actual: {ESTADOS.find(e => e.value === estadoActual)?.label || "Sin revisar"}</option>
            {ESTADOS.filter(e => e.value !== estadoActual).map((est) => (
              <option key={est.value} value={est.value}>
                {est.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cerrar
          </button>
          <button
            type="submit"
            disabled={loading || estado === estadoActual}
            className="px-4 py-2 text-sm font-medium text-white brand-btn rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Cambiando..." : "Cambiar Estado"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
