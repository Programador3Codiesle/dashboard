"use client";

import { FileSpreadsheet, Loader2 } from "lucide-react";
import { SearchFilter } from "@/components/administracion/filters/SearchFilter";
import type { OrdenTallerAbierta, SedeUsuario } from "../types/estado-taller.types";
import { ET_CARD, ET_INPUT } from "../utils/estado-taller.styles";

interface EstadoTallerToolbarProps {
  sedes: SedeUsuario[];
  bodega: string;
  totalAbiertas: number;
  cargando?: boolean;
  onBodegaChange: (bodega: string) => void;
  onBusquedaChange: (value: string) => void;
  onExportarExcel: () => void;
}

export function EstadoTallerToolbar({
  sedes,
  bodega,
  totalAbiertas,
  cargando = false,
  onBodegaChange,
  onBusquedaChange,
  onExportarExcel,
}: EstadoTallerToolbarProps) {
  return (
    <div className="space-y-3">
      <div className={`${ET_CARD} p-4`}>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecciona una bodega
            </label>
            <div className="relative">
              <select
                value={bodega}
                onChange={(e) => onBodegaChange(e.target.value)}
                disabled={cargando}
                className={`w-full ${ET_INPUT} pr-8`}
              >
                <option value="todas">Todas</option>
                {sedes.map((s) => (
                  <option key={s.idsede} value={String(s.idsede)}>
                    {s.descripcion}
                  </option>
                ))}
              </select>
              {cargando && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>
          </div>

          <div className={`${ET_CARD} border border-emerald-200 bg-emerald-50/50 px-4 py-3 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Órdenes abiertas</p>
              <p className="text-2xl font-bold text-gray-900">{totalAbiertas}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${ET_CARD} p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
        <SearchFilter
          onSearch={onBusquedaChange}
          placeholder="Buscar en la tabla..."
          className="flex-1 max-w-md"
        />
        <button
          type="button"
          onClick={onExportarExcel}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Descargar Excel
        </button>
      </div>
    </div>
  );
}

export function exportEstadoTallerExcel(ordenes: OrdenTallerAbierta[], busqueda: string) {
  const q = busqueda.trim().toLowerCase();
  const rows = ordenes.filter((o) => {
    if (!q) return true;
    return [o.bodega, String(o.numero), o.estado, o.cliente, o.placa]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const headers = [
    "Bodega",
    "Orden N",
    "Estado",
    "Razón 2",
    "Fecha Entrega Real",
    "Notas",
    "Fecha Promesa entrega",
    "¿Factura Mes Actual?",
    "Valor MO",
    "Valor RPTO",
    "Valor TOT",
    "Valor MO (Cliente)",
    "Valor RPTO (Cliente)",
    "Valor TOT (Cliente)",
    "Fecha Ingreso",
    "Cliente",
    "Placa VH",
    "Aseguradora",
    "Asesor",
    "Kilometraje",
    "Vehículo",
    "Días",
  ];

  const data = rows.map((o) => [
    o.bodega,
    o.numero,
    o.estado,
    o.razon2Label,
    o.fechaHoraEntregaReal ?? "",
    o.notas,
    o.fechaPromEnt ?? "",
    o.mesFacturaActual,
    o.ventaManoObra,
    o.ventaRptos,
    o.ventaTot,
    o.vManoObraEst ?? 0,
    o.vRptoEst ?? 0,
    o.vTotEst ?? 0,
    o.fecha ?? "",
    o.cliente,
    o.placa,
    o.aseguradora,
    o.asesor,
    o.kilometraje ?? "",
    o.descripcionVehiculo,
    o.diasOtAbierta,
  ]);

  return { headers, data };
}
