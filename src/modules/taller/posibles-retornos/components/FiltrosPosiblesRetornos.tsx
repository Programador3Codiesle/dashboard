"use client";

import { Search } from "lucide-react";
import type { BodegaCatalogo, FiltrosPosiblesRetornosState } from "../types";

interface FiltrosPosiblesRetornosProps {
  filtros: FiltrosPosiblesRetornosState;
  bodegas: BodegaCatalogo[];
  loading?: boolean;
  onChange: (filtros: FiltrosPosiblesRetornosState) => void;
  onBuscar: () => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export function FiltrosPosiblesRetornos({
  filtros,
  bodegas,
  loading = false,
  onChange,
  onBuscar,
}: FiltrosPosiblesRetornosProps) {
  return (
    <div className="bg-white brand-card-elevated rounded-2xl border brand-border-active p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[120px] flex-1">
          <label htmlFor="filtroNumero" className="block text-xs font-semibold text-gray-600 mb-1">
            N° ORDEN
          </label>
          <input
            id="filtroNumero"
            type="number"
            className={inputClass}
            placeholder="N° de Orden"
            value={filtros.numero}
            onChange={(e) => onChange({ ...filtros, numero: e.target.value })}
          />
        </div>

        {bodegas.length > 0 && (
          <div className="min-w-[180px] flex-[2]">
            <label htmlFor="filtroBodega" className="block text-xs font-semibold text-gray-600 mb-1">
              BODEGA
            </label>
            <select
              id="filtroBodega"
              className={inputClass}
              value={filtros.bodega}
              onChange={(e) => onChange({ ...filtros, bodega: e.target.value })}
            >
              <option value="-1">TODAS</option>
              {bodegas.map((b) => (
                <option key={b.bodega} value={String(b.bodega)}>
                  {b.descripcion}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="min-w-[120px] flex-1">
          <label htmlFor="filtroPlaca" className="block text-xs font-semibold text-gray-600 mb-1">
            PLACA
          </label>
          <input
            id="filtroPlaca"
            type="text"
            className={inputClass}
            placeholder="PLACA"
            value={filtros.placa}
            onChange={(e) => onChange({ ...filtros, placa: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="pb-0.5">
          <button
            type="button"
            className="brand-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            onClick={onBuscar}
            disabled={loading}
          >
            <Search size={16} />
            BUSCAR
          </button>
        </div>
      </div>
    </div>
  );
}
