'use client';

import { useState, useRef } from "react";
import Modal from "@/components/shared/ui/Modal";
import { gestionComprasService } from "@/modules/administracion/services/gestion-compras.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { Loader2, Upload } from "lucide-react";

interface EnviarAutorizacionCompraModalProps {
  open: boolean;
  onClose: () => void;
  solicitudId: number;
  onSuccess: () => void;
}

export default function EnviarAutorizacionCompraModal({
  open,
  onClose,
  solicitudId,
  onSuccess,
}: EnviarAutorizacionCompraModalProps) {
  const [comentarios, setComentarios] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentarios.trim() || comentarios.trim().length < 15) {
      showError("Los comentarios deben tener al menos 15 caracteres");
      return;
    }

    setSubiendo(true);
    try {
      const result = await gestionComprasService.enviarAutorizacion(
        solicitudId,
        comentarios,
        archivos
      );

      if (result.status) {
        showSuccess(result.message);
        setComentarios("");
        setArchivos([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onSuccess();
        onClose();
      } else {
        showError(result.message || "Error al enviar la autorización");
      }
    } catch (error) {
      console.error("Error al enviar autorización:", error);
      showError("Error al enviar la autorización");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Enviar Autorización">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccione cotizaciones (opcional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none"
            disabled={subiendo}
          />
          {archivos.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {archivos.length} archivo(s) seleccionado(s)
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentarios adicionales <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            rows={4}
            minLength={15}
            required
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none resize-none"
            placeholder="Escribe comentarios adicionales sobre la autorización..."
            disabled={subiendo}
          />
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 15 caracteres
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            disabled={subiendo}
          >
            Cerrar
          </button>
          <button
            type="submit"
            disabled={subiendo || comentarios.trim().length < 15}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white brand-btn rounded-xl hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {subiendo ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Solicitar Autorización
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
