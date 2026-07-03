"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Portal } from "@/components/shared/ui/Portal";
import { useToast } from "@/components/shared/ui/ToastContext";
import type { EstadoOtCatalogo } from "../../types/estado-taller.types";
import { ET_INPUT } from "../../utils/estado-taller.styles";

interface ModalAgregarEventoProps {
  open: boolean;
  numeroOrden: number | null;
  estados: EstadoOtCatalogo[];
  guardando?: boolean;
  onClose: () => void;
  onGuardar: (payload: {
    ot: number;
    estado: string;
    notas: string;
    fecPromesaEntrega?: string;
  }) => Promise<void>;
}

function ModalAgregarEventoComponent({
  open,
  numeroOrden,
  estados,
  guardando = false,
  onClose,
  onGuardar,
}: ModalAgregarEventoProps) {
  const { showError } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) formRef.current?.reset();
  }, [open, numeroOrden]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (numeroOrden == null) return;
      const form = e.currentTarget;
      const estado =
        (form.elements.namedItem("estado") as HTMLSelectElement)?.value ?? "";
      const notas =
        (form.elements.namedItem("notas") as HTMLTextAreaElement)?.value ?? "";
      const fecPromesaEntrega =
        (form.elements.namedItem("fecPromesaEntrega") as HTMLInputElement)
          ?.value ?? "";

      if (!estado || !notas.trim()) {
        showError("Todos los campos deben ser completados");
        return;
      }

      await onGuardar({
        ot: numeroOrden,
        estado,
        notas: notas.trim(),
        fecPromesaEntrega: fecPromesaEntrega || undefined,
      });
      onClose();
    },
    [numeroOrden, onClose, onGuardar, showError],
  );

  if (!open || numeroOrden == null) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="ev-modal-panel w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl p-5 sm:p-6"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Agregar evento a la orden #{numeroOrden}
          </h3>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select name="estado" className={`w-full ${ET_INPUT}`} defaultValue="">
                <option value="">Seleccione una opción</option>
                {estados.map((e) => (
                  <option key={e.idEstado} value={e.estado}>
                    {e.estado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha promesa entrega
              </label>
              <input
                type="date"
                name="fecPromesaEntrega"
                className={`w-full ${ET_INPUT}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                name="notas"
                rows={3}
                className={`w-full ${ET_INPUT} resize-none`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2 text-sm rounded-lg text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

export const ModalAgregarEvento = React.memo(ModalAgregarEventoComponent);
