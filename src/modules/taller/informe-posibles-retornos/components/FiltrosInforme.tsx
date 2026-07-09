"use client";

import type { BodegaCatalogo, TecnicoCatalogo } from "../types";
import { MIN_YEAR_INFORME } from "../constants/meses-legacy";

interface FiltrosInformeProps {
  year: number;
  tecnico: string;
  sede: string;
  tecnicos: TecnicoCatalogo[];
  bodegas: BodegaCatalogo[];
  onYearChange: (year: number) => void;
  onTecnicoChange: (nit: string) => void;
  onSedeChange: (bodega: string) => void;
  onTecnicoFocus: () => void;
  onSedeFocus: () => void;
  onGenerar: () => void;
  loading?: boolean;
}

export function FiltrosInforme({
  year,
  tecnico,
  sede,
  tecnicos,
  bodegas,
  onYearChange,
  onTecnicoChange,
  onSedeChange,
  onTecnicoFocus,
  onSedeFocus,
  onGenerar,
  loading = false,
}: FiltrosInformeProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white brand-card-elevated rounded-2xl border brand-border-active overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-gray-100">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-auto min-w-[100px]">
            <label htmlFor="year" className="block text-xs font-semibold text-gray-600 mb-1">
              AÑO
            </label>
            <input
              id="year"
              type="number"
              min={MIN_YEAR_INFORME}
              max={currentYear + 1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={year}
              onChange={(e) => onYearChange(Number(e.target.value))}
            />
          </div>

          <div className="flex-1 min-w-[200px]" onFocus={onTecnicoFocus}>
            <label htmlFor="tecnico" className="block text-xs font-semibold text-gray-600 mb-1">
              TÉCNICO
            </label>
            <select
              id="tecnico"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={tecnico}
              onChange={(e) => onTecnicoChange(e.target.value)}
            >
              <option value="">Seleccione</option>
              {tecnicos.map((t) => (
                <option key={t.nit_usuario} value={t.nit_usuario}>
                  {t.nombres}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]" onFocus={onSedeFocus}>
            <label htmlFor="sede" className="block text-xs font-semibold text-gray-600 mb-1">
              SEDE
            </label>
            <select
              id="sede"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              value={sede}
              onChange={(e) => onSedeChange(e.target.value)}
            >
              <option value="">TODAS</option>
              {bodegas.map((b) => (
                <option key={b.bodega} value={String(b.bodega)}>
                  {b.descripcion}
                </option>
              ))}
            </select>
          </div>

          <div className="pb-0.5">
            <button
              type="button"
              id="loadGraph"
              className="brand-btn px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
              onClick={onGenerar}
              disabled={loading || !year}
            >
              GENERAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
