'use client';

import { CriterioDef } from '../definitions/form-configs';

type Props = {
  numero: number;
  criterio: CriterioDef;
  value?: string;
  obsValue?: string;
  onChange: (field: string, value: string) => void;
  onObsChange?: (field: string, value: string) => void;
};

export function ChecklistCriterioItem({
  numero,
  criterio,
  value,
  obsValue = '',
  onChange,
  onObsChange,
}: Props) {
  const modo = criterio.modo ?? 'ternario';

  return (
    <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm">
      <div className="mb-2 flex items-start gap-2">
        <span className="m-2 inline-flex h-7 min-w-7 items-center justify-center rounded bg-blue-600 px-2 text-sm font-semibold text-white">
          {numero}
        </span>
        <h6 className="mb-0 flex-1 text-sm font-bold text-gray-800">{criterio.label}</h6>
      </div>
      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-12">
        {modo === 'binario' ? (
          <>
            <label className="flex items-center justify-center gap-2 text-sm md:col-span-2">
              <input
                type="radio"
                name={criterio.field}
                value="1"
                checked={value === '1'}
                onChange={() => onChange(criterio.field, '1')}
                required
              />
              Conforme
            </label>
            <label className="flex items-center justify-center gap-2 text-sm md:col-span-2">
              <input
                type="radio"
                name={criterio.field}
                value="0"
                checked={value === '0'}
                onChange={() => onChange(criterio.field, '0')}
                required
              />
              No Conforme
            </label>
          </>
        ) : modo === 'si_na' ? (
          <>
            <label className="flex items-center justify-center gap-2 text-sm md:col-span-2">
              <input
                type="radio"
                name={criterio.field}
                value="1"
                checked={value === '1'}
                onChange={() => onChange(criterio.field, '1')}
                required
              />
              Sí
            </label>
            <label className="flex items-center justify-center gap-2 text-sm md:col-span-2">
              <input
                type="radio"
                name={criterio.field}
                value="2"
                checked={value === '2'}
                onChange={() => onChange(criterio.field, '2')}
                required
              />
              N/A
            </label>
          </>
        ) : (
          <>
            <label className="flex items-center justify-center gap-2 text-sm md:col-span-2">
              <input
                type="radio"
                name={criterio.field}
                value="1"
                checked={value === '1'}
                onChange={() => onChange(criterio.field, '1')}
                required
              />
              Conforme
            </label>
            <label className="flex items-center justify-center gap-2 text-sm md:col-span-2">
              <input
                type="radio"
                name={criterio.field}
                value="0"
                checked={value === '0'}
                onChange={() => onChange(criterio.field, '0')}
                required
              />
              No Conforme
            </label>
            <label className="flex items-center justify-center gap-2 text-sm md:col-span-2">
              <input
                type="radio"
                name={criterio.field}
                value="2"
                checked={value === '2'}
                onChange={() => onChange(criterio.field, '2')}
                required
              />
              No aplica
            </label>
          </>
        )}
        {criterio.obsField && (
          <textarea
            className="min-h-[72px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:col-span-6"
            rows={2}
            value={obsValue}
            onChange={(e) => onObsChange?.(criterio.obsField!, e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
