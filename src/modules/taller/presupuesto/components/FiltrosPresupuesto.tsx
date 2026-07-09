"use client";

import { Search } from "lucide-react";
import { CATEGORIAS_PRESUPUESTO } from "../constants/categorias";
import type { CatalogosPresupuesto, FiltrosPresupuestoState } from "../types";

interface FiltrosPresupuestoProps {
  filtros: FiltrosPresupuestoState;
  catalogos?: CatalogosPresupuesto;
  loading?: boolean;
  onChange: (filtros: FiltrosPresupuestoState) => void;
  onConsultar: () => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]";

export function FiltrosPresupuesto({
  filtros,
  catalogos,
  loading = false,
  onChange,
  onConsultar,
}: FiltrosPresupuestoProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConsultar();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white brand-card-elevated rounded-2xl border brand-border-active p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[160px] flex-1">
          <label
            htmlFor="idCategoria"
            className="block text-xs font-semibold text-gray-600 mb-1"
          >
            Categoría *
          </label>
          <select
            id="idCategoria"
            className={inputClass}
            value={filtros.idCategoria}
            onChange={(e) =>
              onChange({ ...filtros, idCategoria: e.target.value })
            }
            required
          >
            <option value="">Seleccione una categoría</option>
            {CATEGORIAS_PRESUPUESTO.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px] flex-1">
          <label
            htmlFor="idSede"
            className="block text-xs font-semibold text-gray-600 mb-1"
          >
            Sede *
          </label>
          <select
            id="idSede"
            className={inputClass}
            value={filtros.idSede}
            onChange={(e) => onChange({ ...filtros, idSede: e.target.value })}
            required
          >
            <option value="">Seleccione una sede</option>
            {(catalogos?.sedes ?? []).map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[160px] flex-1">
          <label
            htmlFor="idTipo"
            className="block text-xs font-semibold text-gray-600 mb-1"
          >
            Tipo
          </label>
          <select
            id="idTipo"
            className={inputClass}
            value={filtros.idTipo}
            onChange={(e) => onChange({ ...filtros, idTipo: e.target.value })}
          >
            <option value="">Seleccione un tipo</option>
            {(catalogos?.tipos ?? []).map((t) => (
              <option key={t.id} value={String(t.id)}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex pb-0.5">
          <button
            type="submit"
            className="brand-btn inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            disabled={loading}
          >
            <Search size={16} />
            Consultar
          </button>
        </div>
      </div>
    </form>
  );
}
