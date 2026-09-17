'use client';

import { ChevronDown } from 'lucide-react';

type HoraMilitarSelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  opciones: string[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
};

export function HoraMilitarSelect({
  id,
  name,
  value,
  onChange,
  opciones,
  required = false,
  disabled = false,
  className,
  'aria-label': ariaLabel,
  'data-testid': testId,
}: HoraMilitarSelectProps) {
  return (
    <div className="relative mt-1">
      <select
        id={id}
        name={name}
        data-testid={testId}
        aria-label={ariaLabel}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      >
        <option value="">Seleccione...</option>
        {opciones.map((hora) => (
          <option key={hora} value={hora}>
            {hora}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
        aria-hidden
      />
    </div>
  );
}
