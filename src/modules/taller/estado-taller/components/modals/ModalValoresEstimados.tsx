"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Portal } from "@/components/shared/ui/Portal";
import { ET_INPUT } from "../../utils/estado-taller.styles";

interface ModalValoresEstimadosProps {
  open: boolean;
  numeroOrden: number | null;
  guardando?: boolean;
  onClose: () => void;
  onGuardar: (payload: {
    inputNumeroOr: number;
    inputMO: number;
    inputRpto: number;
    inputToT: number;
  }) => Promise<void>;
}

function ModalValoresEstimadosComponent({
  open,
  numeroOrden,
  guardando = false,
  onClose,
  onGuardar,
}: ModalValoresEstimadosProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) formRef.current?.reset();
  }, [open, numeroOrden]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (numeroOrden == null) return;
      const form = e.currentTarget;
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const inputMO = Number(
        (form.elements.namedItem("inputMO") as HTMLInputElement).value,
      );
      const inputRpto = Number(
        (form.elements.namedItem("inputRpto") as HTMLInputElement).value,
      );
      const inputToT = Number(
        (form.elements.namedItem("inputToT") as HTMLInputElement).value,
      );
      await onGuardar({
        inputNumeroOr: numeroOrden,
        inputMO,
        inputRpto,
        inputToT,
      });
      onClose();
    },
    [numeroOrden, onClose, onGuardar],
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
            Valores estimados — Orden #{numeroOrden}
          </h3>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor mano de obra
              </label>
              <input
                type="number"
                name="inputMO"
                required
                min={0}
                className={`w-full ${ET_INPUT}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor repuestos
              </label>
              <input
                type="number"
                name="inputRpto"
                required
                min={0}
                className={`w-full ${ET_INPUT}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor TOT
              </label>
              <input
                type="number"
                name="inputToT"
                required
                min={0}
                className={`w-full ${ET_INPUT}`}
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
                className="px-4 py-2 text-sm rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}

export const ModalValoresEstimados = React.memo(ModalValoresEstimadosComponent);
