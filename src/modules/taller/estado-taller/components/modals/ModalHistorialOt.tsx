"use client";

import React from "react";
import { Portal } from "@/components/shared/ui/Portal";
import type { HistorialOt } from "../../types/estado-taller.types";
import { EstadoTallerLoading } from "../EstadoTallerLoading";

interface ModalHistorialOtProps {
  open: boolean;
  numeroOrden: number | null;
  historial: HistorialOt[];
  loading?: boolean;
  onClose: () => void;
}

function ModalHistorialOtComponent({
  open,
  numeroOrden,
  historial,
  loading = false,
  onClose,
}: ModalHistorialOtProps) {
  if (!open || numeroOrden == null) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="ev-modal-panel w-full max-w-3xl rounded-2xl border border-gray-200 shadow-2xl p-5 sm:p-6 max-h-[88vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Historial de la orden #{numeroOrden}
          </h3>
          {loading ? (
            <EstadoTallerLoading message="Cargando historial..." compact />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-2 pr-3">Orden N</th>
                    <th className="py-2 pr-3">Asesor</th>
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">Notas</th>
                    <th className="py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        No hay historial para esta orden
                      </td>
                    </tr>
                  ) : (
                    historial.map((row, idx) => (
                      <tr key={`${row.numero}-${row.fechaHist}-${idx}`} className="border-b border-gray-100">
                        <td className="py-2 pr-3">{row.numero}</td>
                        <td className="py-2 pr-3">{row.asesor}</td>
                        <td className="py-2 pr-3">{row.estado}</td>
                        <td className="py-2 pr-3">{row.notas ?? "—"}</td>
                        <td className="py-2">{row.fechaHist ?? "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
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

export const ModalHistorialOt = React.memo(ModalHistorialOtComponent);
