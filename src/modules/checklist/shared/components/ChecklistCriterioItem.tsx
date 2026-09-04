'use client';

import type { CriterioDef } from '../definitions/form-configs';
import { inputClass } from '../constants/ui';

type Props = {
  numero: number;
  criterio: CriterioDef;
  value?: string;
  obsValue?: string;
  onChange: (field: string, value: string) => void;
  onObsChange?: (field: string, value: string) => void;
};

function RadioOpcion({
  name,
  value,
  checked,
  label,
  onSelect,
}: {
  name: string;
  value: string;
  checked: boolean;
  label: string;
  onSelect: (value: string) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        required
      />
      {label}
    </label>
  );
}

export function ChecklistCriterioItem({
  numero,
  criterio,
  value,
  obsValue = '',
  onChange,
  onObsChange,
}: Props) {
  const modo = criterio.modo ?? 'ternario';
  const obsId = criterio.obsField ? `chk-obs-${criterio.obsField}` : undefined;
  const select = (next: string) => onChange(criterio.field, next);

  const opciones =
    modo === 'binario'
      ? [
          { value: '1', label: 'Conforme' },
          { value: '0', label: 'No Conforme' },
        ]
      : modo === 'si_na'
        ? [
            { value: '1', label: 'Sí' },
            { value: '2', label: 'N/A' },
          ]
        : [
            { value: '1', label: 'Conforme' },
            { value: '0', label: 'No Conforme' },
            { value: '2', label: 'No aplica' },
          ];

  return (
    <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm">
      <div className="mb-2 flex items-start gap-2">
        <span className="m-2 inline-flex h-7 min-w-7 items-center justify-center rounded brand-bg px-2 text-sm font-semibold text-white">
          {numero}
        </span>
        <h6 className="mb-0 min-w-0 flex-1 text-sm font-bold text-gray-800">{criterio.label}</h6>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start">
        <div className="flex min-w-0 flex-wrap gap-x-4 gap-y-2">
          {opciones.map((opcion) => (
            <RadioOpcion
              key={opcion.value}
              name={criterio.field}
              value={opcion.value}
              checked={value === opcion.value}
              label={opcion.label}
              onSelect={select}
            />
          ))}
        </div>
        {criterio.obsField && (
          <textarea
            id={obsId}
            aria-label={`Observación: ${criterio.label}`}
            className={`${inputClass} min-h-[72px] w-full min-w-0 flex-1 md:min-w-[16rem]`}
            rows={2}
            value={obsValue}
            onChange={(e) => onObsChange?.(criterio.obsField!, e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
