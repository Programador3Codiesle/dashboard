"use client";

import { Portal } from "@/components/shared/ui/Portal";
import type { SolucionRetorno } from "../../types";
import { displayValor } from "../../utils/validaciones-gestion";

interface ModalSolucionRetornoProps {
  open: boolean;
  solucion: SolucionRetorno | null;
  onClose: () => void;
}

export function ModalSolucionRetorno({
  open,
  solucion,
  onClose,
}: ModalSolucionRetornoProps) {
  if (!open || !solucion) return null;

  const definicionTexto =
    solucion.definicion === 1 ? "SI" : solucion.definicion === 0 ? "NO" : "--";

  return (
    <Portal>
      <div
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="ev-modal-panel w-full max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 shadow-2xl bg-white"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-4 border-b border-gray-200 text-center">
            <h2 className="text-lg font-semibold brand-text">
              SOLUCIONES A POSIBLES RETORNOS
            </h2>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-gray-50 border text-center">
                  <th className="px-2 py-2 border">ORDEN ORIGEN</th>
                  <th className="px-2 py-2 border">DEFINICIÓN</th>
                  <th className="px-2 py-2 border">RAZÓN RETORNO</th>
                  <th className="px-2 py-2 border">OBSERVACIÓN</th>
                  <th className="px-2 py-2 border">SISTEMA INTERVENIDO</th>
                  <th className="px-2 py-2 border">OBSERVACIÓN</th>
                  <th className="px-2 py-2 border">PLAN DE ACCIÓN</th>
                  <th className="px-2 py-2 border">OBSERVACIÓN</th>
                  <th className="px-2 py-2 border">REPUESTOS</th>
                  <th className="px-2 py-2 border">MANO DE OBRA</th>
                  <th className="px-2 py-2 border">TOT</th>
                  <th className="px-2 py-2 border">OBSERVACIÓN</th>
                  <th className="px-2 py-2 border">TÉCNICO</th>
                  <th className="px-2 py-2 border">ORDEN RETORNO</th>
                  <th className="px-2 py-2 border">FECHA</th>
                  <th className="px-2 py-2 border">USUARIO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center border">
                  <td className="px-2 py-2 border">{displayValor(solucion.numero)}</td>
                  <td className="px-2 py-2 border">{definicionTexto}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.razon)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.obs_razon)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.sistema_inv)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.obs_sist_inv)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.plan_accion)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.obs_plan)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.repuestos)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.mano_obra)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.tot)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.obs_costo)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.tecnico)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.numero_retorno)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.fecha_creacion)}</td>
                  <td className="px-2 py-2 border">{displayValor(solucion.nombres)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end p-4 border-t border-gray-200">
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
