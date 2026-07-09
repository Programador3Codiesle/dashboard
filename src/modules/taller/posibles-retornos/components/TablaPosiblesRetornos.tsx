"use client";

import { BookOpen, Eye, XCircle } from "lucide-react";
import type { FilaPosibleRetorno } from "../types";

interface TablaPosiblesRetornosProps {
  filas: FilaPosibleRetorno[];
  onVerDetalle: (placa: string, numero: number) => void;
  onVerSolucion: (numero: number) => void;
  onCerrarBdc: (numero: number) => void;
}

export function TablaPosiblesRetornos({
  filas,
  onVerDetalle,
  onVerSolucion,
  onCerrarBdc,
}: TablaPosiblesRetornosProps) {
  if (!filas.length) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        No hay registros para mostrar
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-center">
            <th className="px-3 py-2 text-xs font-semibold text-gray-700">#</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-700">ORDEN</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-700">PLACA</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-700">DESC MODELO</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-700">ORIGEN</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-700">BODEGA</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-700">ESTADO</th>
            <th className="px-3 py-2 text-xs font-semibold text-gray-700">DETALLE</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, index) => (
            <tr
              key={`${fila.rn}-${fila.numero}-${fila.placa}-${fila.origen}-${index}`}
              className="border-b border-gray-100 hover:bg-gray-50/50"
            >
              <td className="px-3 py-2 text-center">{fila.rn}</td>
              <td className="px-3 py-2 text-center font-medium">{fila.numero}</td>
              <td className="px-3 py-2 text-center">{fila.placa}</td>
              <td className="px-3 py-2 text-center whitespace-nowrap">{fila.des_modelo}</td>
              <td className="px-3 py-2 text-center">{fila.origen}</td>
              <td className="px-3 py-2 text-center">{fila.descripcion}</td>
              <td className="px-3 py-2 text-center">{fila.estado}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap justify-center gap-1.5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => onVerDetalle(fila.placa, fila.numero)}
                  >
                    <Eye size={14} />
                    VER
                  </button>
                  {fila.acciones.puedeSolucion && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600"
                      onClick={() => onVerSolucion(fila.numero)}
                    >
                      <BookOpen size={14} />
                      SOLUCIÓN
                    </button>
                  )}
                  {fila.acciones.puedeCerrar && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700"
                      onClick={() => onCerrarBdc(fila.numero)}
                    >
                      <XCircle size={14} />
                      CERRAR
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
