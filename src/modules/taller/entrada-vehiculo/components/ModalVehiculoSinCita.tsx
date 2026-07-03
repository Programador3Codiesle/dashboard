"use client";

import { useCallback, useEffect, useRef } from "react";
import React from "react";
import { Portal } from "@/components/shared/ui/Portal";
import { useToast } from "@/components/shared/ui/ToastContext";
import type { SedeUsuario } from "../types/entrada-vehiculo.types";
import { EV_INPUT, EV_INGRESAR_BTN } from "../utils/entrada-vehiculo.styles";

interface ModalVehiculoSinCitaProps {
  open: boolean;
  onClose: () => void;
  sedes: SedeUsuario[];
  onGuardar: (payload: {
    placa: string;
    cliente: string;
    motivo: string;
    bodega: number;
  }) => Promise<void>;
  guardando?: boolean;
}

function getFormValue(form: HTMLFormElement, name: string): string {
  const el = form.elements.namedItem(name) as
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement
    | null;
  return el?.value ?? "";
}

/**
 * Formulario no controlado (useRef) para evitar re-renders en cada tecla.
 * Solo re-renderiza al abrir/cerrar y al cambiar guardando/sedes.
 */
function ModalVehiculoSinCitaComponent({
  open,
  onClose,
  sedes,
  onGuardar,
  guardando = false,
}: ModalVehiculoSinCitaProps) {
  const { showError } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (open) {
      formRef.current?.reset();
    }
  }, [open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const placa = getFormValue(form, "placa").trim().toUpperCase();
      const cliente = getFormValue(form, "cliente").trim().toUpperCase();
      const motivo = getFormValue(form, "motivo").trim();
      const bodega = getFormValue(form, "bodega");

      if (!placa || !cliente || !motivo) {
        showError("Por favor llene todos los campos");
        return;
      }
      if (placa.length !== 6) {
        showError("El número de dígitos de la placa no coincide");
        return;
      }
      if (!bodega) {
        showError("Seleccione una bodega");
        return;
      }

      await onGuardar({
        placa,
        cliente,
        motivo,
        bodega: Number(bodega),
      });
      onClose();
    },
    [onClose, onGuardar, showError],
  );

  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="ev-modal-panel w-full max-w-[420px] rounded-2xl border border-gray-200 shadow-2xl p-5 sm:p-6 max-h-[88vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ev-modal-sin-cita-title"
        >
          <h3
            id="ev-modal-sin-cita-title"
            className="text-lg sm:text-xl font-semibold text-gray-900 mb-4"
          >
            Ingreso vehículo sin cita
          </h3>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placa del vehículo
              </label>
              <input
                type="text"
                name="placa"
                maxLength={6}
                autoComplete="off"
                className={`w-full ${EV_INPUT} uppercase`}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taller al que se dirige
              </label>
              <select name="bodega" className={`w-full ${EV_INPUT}`} defaultValue="">
                <option value="">Seleccione una bodega</option>
                {sedes.map((s) => (
                  <option key={s.idsede} value={s.idsede}>
                    {s.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del cliente
              </label>
              <input
                type="text"
                name="cliente"
                autoComplete="off"
                className={`w-full ${EV_INPUT}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo de la visita
              </label>
              <textarea
                name="motivo"
                rows={3}
                className={`w-full ${EV_INPUT} resize-none`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className={`${EV_INGRESAR_BTN} w-auto px-5 disabled:opacity-50`}
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

export const ModalVehiculoSinCita = React.memo(ModalVehiculoSinCitaComponent);
