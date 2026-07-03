"use client";

import React from "react";
import { Portal } from "@/components/shared/ui/Portal";
import { openLegacySacyrEditor } from "../../utils/legacy-sacyr";

interface ModalCotizacionesSacyrProps {
  open: boolean;
  numeroOrden: number | null;
  cotizacionIds: number[];
  onClose: () => void;
}

function ModalCotizacionesSacyrComponent({
  open,
  numeroOrden,
  cotizacionIds,
  onClose,
}: ModalCotizacionesSacyrProps) {
  if (!open || numeroOrden == null) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="ev-modal-panel w-full max-w-sm rounded-2xl border border-gray-200 shadow-2xl p-5 sm:p-6"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cotizaciones Sacyr — Orden #{numeroOrden}
          </h3>
          <div className="flex flex-wrap gap-2">
            {cotizacionIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => openLegacySacyrEditor(id)}
                className="px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {id}
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-4 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

export const ModalCotizacionesSacyr = React.memo(ModalCotizacionesSacyrComponent);
