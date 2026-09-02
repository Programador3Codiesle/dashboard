'use client';

import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/repuestos/shared/constants/ui';

export type FiltrosEvForm = {
  nOrden: string;
  placa: string;
  bodega: string;
  fechaRegistro: string;
};

export type BodegaEvOption = { bodega: number; descripcion: string };

export const FILTROS_EV_VACIOS: FiltrosEvForm = {
  nOrden: '',
  placa: '',
  bodega: '',
  fechaRegistro: '',
};

export function toEvListarPayload(filtros: FiltrosEvForm) {
  return {
    nOrden: filtros.nOrden ? Number(filtros.nOrden) : undefined,
    placa: filtros.placa || undefined,
    bodega: filtros.bodega ? Number(filtros.bodega) : undefined,
    fechaRegistro: filtros.fechaRegistro || undefined,
  };
}

export function FiltrosEvBar({
  filtros,
  onChange,
  bodegas,
  onBuscar,
}: {
  filtros: FiltrosEvForm;
  onChange: (next: FiltrosEvForm) => void;
  bodegas: BodegaEvOption[];
  onBuscar: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
      <input
        type="number"
        placeholder="N° Orden"
        className={inputClass}
        value={filtros.nOrden}
        onChange={(e) => onChange({ ...filtros, nOrden: e.target.value })}
      />
      <input
        placeholder="Placa"
        className={inputClass}
        value={filtros.placa}
        onChange={(e) =>
          onChange({ ...filtros, placa: e.target.value.toUpperCase() })
        }
      />
      <select
        className={inputClass}
        value={filtros.bodega}
        onChange={(e) => onChange({ ...filtros, bodega: e.target.value })}
      >
        <option value="">Bodega</option>
        {bodegas.map((b) => (
          <option key={b.bodega} value={b.bodega}>
            {b.descripcion}
          </option>
        ))}
      </select>
      <input
        type="date"
        className={inputClass}
        value={filtros.fechaRegistro}
        onChange={(e) =>
          onChange({ ...filtros, fechaRegistro: e.target.value })
        }
      />
      <button type="button" className={btnPrimaryClass} onClick={onBuscar}>
        Buscar
      </button>
    </div>
  );
}
