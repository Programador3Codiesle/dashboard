'use client';

import React, { useRef, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

/**
 * Componente de select optimizado
 * Usa useRef para evitar re-renders innecesarios
 */
export const SelectFilter = React.memo(({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccione...",
  className = ""
}: SelectFilterProps) => {
  const selectRef = useRef<HTMLSelectElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative mt-1">
        <select
          ref={selectRef}
          className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10"
          value={value}
          onChange={handleChange}
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
});

SelectFilter.displayName = 'SelectFilter';
