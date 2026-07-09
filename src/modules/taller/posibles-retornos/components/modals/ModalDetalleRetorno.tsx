"use client";

import { Portal } from "@/components/shared/ui/Portal";
import type { DetallePlacaResponse } from "../../types";

interface ModalDetalleRetornoProps {
  open: boolean;
  detalle: DetallePlacaResponse | null;
  ordenOrigen: number | null;
  onClose: () => void;
  onGestionar: () => void;
}

export function ModalDetalleRetorno({
  open,
  detalle,
  ordenOrigen,
  onClose,
  onGestionar,
}: ModalDetalleRetornoProps) {
  if (!open || !detalle) return null;

  const { cliente, ordenes, tecnicos } = detalle;

  return (
    <Portal>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="ev-modal-panel w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 shadow-2xl bg-white"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Placa</label>
                <input readOnly value={cliente.placa} className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Desc Modelo</label>
                <input readOnly value={cliente.des_modelo} className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">N° Retornos</label>
                <input readOnly value={cliente.cant_retornos} className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50" />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cliente</label>
                <input readOnly value={cliente.cliente} className="w-full rounded-lg border px-3 py-2 text-sm bg-gray-50" />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th colSpan={5} className="text-center py-2 font-semibold bg-gray-50 border">
                      CLIENTE DICE
                    </th>
                  </tr>
                  <tr className="bg-gray-50 border-b text-center text-xs font-semibold text-gray-700">
                    <th className="px-2 py-2">RNK</th>
                    <th className="px-2 py-2">PLACA</th>
                    <th className="px-2 py-2">N° ORDEN</th>
                    <th className="px-2 py-2">SOLICITUD</th>
                    <th className="px-2 py-2">RESPUESTA</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenes.map((o, index) => (
                    <tr key={`orden-${o.numero}-${o.rnk}-${index}`} className="border-b text-center">
                      <td className="px-2 py-2">{o.rnk}</td>
                      <td className="px-2 py-2">{o.placa}</td>
                      <td className="px-2 py-2">{o.numero}</td>
                      <td className="px-2 py-2">{o.solicitud}</td>
                      <td className="px-2 py-2">{o.respuesta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th colSpan={4} className="text-center py-2 font-semibold bg-gray-50 border">
                      TÉCNICOS
                    </th>
                  </tr>
                  <tr className="bg-gray-50 border-b text-center text-xs font-semibold text-gray-700">
                    <th className="px-2 py-2">RNK</th>
                    <th className="px-2 py-2">PLACA</th>
                    <th className="px-2 py-2">N° ORDEN</th>
                    <th className="px-2 py-2">TÉCNICO</th>
                  </tr>
                </thead>
                <tbody>
                  {tecnicos.map((t, index) => (
                    <tr key={`tecnico-${t.numero}-${t.rnk}-${t.tecnicos}-${index}`} className="border-b text-center">
                      <td className="px-2 py-2">{t.rnk}</td>
                      <td className="px-2 py-2">{t.placa}</td>
                      <td className="px-2 py-2">{t.numero}</td>
                      <td className="px-2 py-2">{t.tecnicos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
              onClick={onGestionar}
            >
              Gestionar
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 hover:bg-gray-50"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
