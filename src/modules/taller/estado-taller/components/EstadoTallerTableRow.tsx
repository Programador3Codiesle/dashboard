"use client";

import React from "react";
import type { OrdenTallerAbierta } from "../types/estado-taller.types";
import {
  ET_COL_ESTADO,
  ET_COL_FACTURA,
  formatMonto,
  rowBorderClass,
  rowToneClass,
} from "../utils/estado-taller.styles";
import { EstadoTallerRowActions } from "./EstadoTallerRowActions";

interface EstadoTallerTableRowProps {
  orden: OrdenTallerAbierta;
  onAgregarEvento: (numero: number) => void;
  onVerHistorial: (numero: number) => void;
  onValoresEstimados: (numero: number) => void;
  onFacturaMes: (numero: number) => void;
  onSacyr: (numero: number, ids: number[]) => void;
}

function EstadoTallerTableRowComponent({
  orden,
  onAgregarEvento,
  onVerHistorial,
  onValoresEstimados,
  onFacturaMes,
  onSacyr,
}: EstadoTallerTableRowProps) {
  return (
    <tr
      className={`border-b border-gray-100 ${rowToneClass(orden.rowTone)} ${rowBorderClass(orden.borderEspera)}`}
    >
      <td className="px-2 py-2 align-top">
        <EstadoTallerRowActions
          orden={orden}
          onAgregarEvento={onAgregarEvento}
          onVerHistorial={onVerHistorial}
          onValoresEstimados={onValoresEstimados}
          onFacturaMes={onFacturaMes}
          onSacyr={onSacyr}
        />
      </td>
      <td className="px-2 py-2">{orden.bodega}</td>
      <td className="px-2 py-2 font-semibold">{orden.numero}</td>
      <td className={`px-2 py-2 ${ET_COL_ESTADO}`}>{orden.estado}</td>
      <td className={`px-2 py-2 ${ET_COL_ESTADO}`}>{orden.razon2Label}</td>
      <td className={`px-2 py-2 ${ET_COL_ESTADO}`}>
        {orden.fechaHoraEntregaReal ?? "—"}
      </td>
      <td className={`px-2 py-2 ${ET_COL_ESTADO} max-w-[200px]`}>
        {orden.notas || "—"}
      </td>
      <td className={`px-2 py-2 ${ET_COL_ESTADO}`}>
        {orden.fechaPromEnt ?? "—"}
      </td>
      <td className={`px-2 py-2 text-center ${ET_COL_FACTURA}`}>
        {orden.mesFacturaActual}
      </td>
      <td className="px-2 py-2 text-right">{formatMonto(orden.ventaManoObra)}</td>
      <td className="px-2 py-2 text-right">{formatMonto(orden.ventaRptos)}</td>
      <td className="px-2 py-2 text-right">{formatMonto(orden.ventaTot)}</td>
      <td className="px-2 py-2 text-right">{formatMonto(orden.vManoObraEst)}</td>
      <td className="px-2 py-2 text-right">{formatMonto(orden.vRptoEst)}</td>
      <td className="px-2 py-2 text-right">{formatMonto(orden.vTotEst)}</td>
      <td className="px-2 py-2">{orden.fecha ?? "—"}</td>
      <td className="px-2 py-2">{orden.cliente}</td>
      <td className="px-2 py-2 font-semibold">{orden.placa}</td>
      <td className="px-2 py-2">{orden.aseguradora}</td>
      <td className="px-2 py-2">{orden.asesor}</td>
      <td className="px-2 py-2">{orden.kilometraje ?? "—"}</td>
      <td className="px-2 py-2">{orden.descripcionVehiculo}</td>
      <td className="px-2 py-2 text-center">{orden.diasOtAbierta}</td>
    </tr>
  );
}

export const EstadoTallerTableRow = React.memo(EstadoTallerTableRowComponent);
