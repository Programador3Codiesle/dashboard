"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Portal } from "@/components/shared/ui/Portal";
import type { ModalActualizarState } from "../../types";

interface ModalActualizarPresupuestoProps {
  open: boolean;
  state: ModalActualizarState | null;
  guardando?: boolean;
  onClose: () => void;
  onGuardar: (nuevoValor: number) => Promise<void>;
}

export function ModalActualizarPresupuesto({
  open,
  state,
  guardando = false,
  onClose,
  onGuardar,
}: ModalActualizarPresupuestoProps) {
  const [nuevoValor, setNuevoValor] = useState("");

  useEffect(() => {
    if (open) setNuevoValor("");
  }, [open, state]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const parsed = Number(nuevoValor);
      if (!nuevoValor.trim() || Number.isNaN(parsed)) return;
      await onGuardar(parsed);
    },
    [nuevoValor, onGuardar],
  );

  if (!open || !state) return null;

  const titulo =
    state.tipo === "saldo" ? "Actualizar Saldo" : "Actualizar Presupuesto";

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[10100] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="ev-modal-panel w-full max-w-md rounded-2xl border border-gray-200 shadow-2xl p-5 sm:p-6 bg-white"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-presupuesto-title"
        >
          <h2
            id="modal-presupuesto-title"
            className="text-lg font-semibold text-gray-900 mb-4"
          >
            {titulo}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
              Mes en actualización:{" "}
              <span className="font-medium">{state.celda.mesLabel}</span>
            </p>
            <p className="text-sm text-gray-600">
              Valor actual:{" "}
              <span className="font-medium">{state.valorActual ?? "—"}</span>
            </p>

            <div>
              <label
                htmlFor="nuevoValor"
                className="block text-xs font-semibold text-gray-600 mb-1"
              >
                Nuevo valor
              </label>
              <input
                id="nuevoValor"
                type="number"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Ingrese el nuevo valor"
                value={nuevoValor}
                onChange={(e) => setNuevoValor(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                onClick={onClose}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="brand-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                disabled={guardando}
              >
                {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
