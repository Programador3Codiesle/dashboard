"use client";

import { FileSpreadsheet, Search } from "lucide-react";
import {
  buildMonthBounds,
  getYearOneOptions,
  getYearTwoOptions,
} from "../constants/years";
import type { FiltrosPygState } from "../types";

interface FiltrosPygTecnicosProps {
  filtros: FiltrosPygState;
  onChange: (filtros: FiltrosPygState) => void;
  onGenerar: () => void;
  onExportExcel: () => void;
  loading?: boolean;
  canExport?: boolean;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export function FiltrosPygTecnicos({
  filtros,
  onChange,
  onGenerar,
  onExportExcel,
  loading = false,
  canExport = false,
}: FiltrosPygTecnicosProps) {
  const yearOneOptions = getYearOneOptions();
  const yearTwoOptions = getYearTwoOptions();
  const monthBounds = buildMonthBounds(filtros.yearOne);

  const handleYearOneChange = (value: string) => {
    onChange({
      ...filtros,
      yearOne: value,
      monthOne: "",
      monthTwo: "",
    });
  };

  const handleYearTwoChange = (value: string) => {
    onChange({ ...filtros, yearTwo: value });
  };

  return (
    <div className="bg-white brand-card-elevated rounded-2xl border brand-border-active p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[140px] flex-1">
          <label htmlFor="year_one" className="block text-xs font-semibold text-gray-600 mb-1">
            AÑO INFORME
          </label>
          <select
            id="year_one"
            className={inputClass}
            value={filtros.yearOne}
            onChange={(e) => handleYearOneChange(e.target.value)}
            required
          >
            <option value="">Seleccione un año</option>
            {yearOneOptions.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[140px] flex-1">
          <label htmlFor="month_one" className="block text-xs font-semibold text-gray-600 mb-1">
            DESDE
          </label>
          <input
            id="month_one"
            type="month"
            className={inputClass}
            value={filtros.monthOne}
            min={monthBounds?.min}
            max={monthBounds?.max}
            onChange={(e) => onChange({ ...filtros, monthOne: e.target.value })}
            disabled={!filtros.yearOne}
            required
          />
        </div>

        <div className="min-w-[140px] flex-1">
          <label htmlFor="month_two" className="block text-xs font-semibold text-gray-600 mb-1">
            HASTA
          </label>
          <input
            id="month_two"
            type="month"
            className={inputClass}
            value={filtros.monthTwo}
            min={monthBounds?.min}
            max={monthBounds?.max}
            onChange={(e) => onChange({ ...filtros, monthTwo: e.target.value })}
            disabled={!filtros.yearOne}
            required
          />
        </div>

        <div className="min-w-[160px] flex-1">
          <label htmlFor="year_two" className="block text-xs font-semibold text-gray-600 mb-1">
            AÑO A COMPARAR
          </label>
          <select
            id="year_two"
            className={inputClass}
            value={filtros.yearTwo}
            onChange={(e) => handleYearTwoChange(e.target.value)}
            required
          >
            <option value="">Seleccione un año</option>
            {yearTwoOptions.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 pb-0.5">
          <button
            type="button"
            className="brand-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            onClick={onGenerar}
            disabled={loading}
          >
            <Search size={16} />
            GENERAR
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors disabled:opacity-50"
            onClick={onExportExcel}
            disabled={!canExport || loading}
          >
            <FileSpreadsheet size={16} />
            GENERAR EXCEL
          </button>
        </div>
      </div>
    </div>
  );
}
