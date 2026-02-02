'use client';

import React, { useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface FormSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
}

/**
 * Componente de select optimizado para formularios
 * Usa useRef para evitar re-renders innecesarios
 */
export const FormSelect = React.memo(({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccione...",
  required = false,
  className = "",
  labelClassName = ""
}: FormSelectProps) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div>
      {label && (
        <label className={labelClassName}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative mt-1">
        <select
          ref={selectRef}
          className={`block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10 ${className || ""}`}
          value={value}
          onChange={handleChange}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian las props relevantes
  return (
    prevProps.value === nextProps.value &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.options.length === nextProps.options.length &&
    prevProps.required === nextProps.required &&
    prevProps.label === nextProps.label
  );
});

FormSelect.displayName = 'FormSelect';
