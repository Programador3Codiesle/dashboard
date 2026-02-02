'use client';

import React, { useRef, useCallback } from 'react';
import { Calendar } from 'lucide-react';

interface DateFilterInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Componente de input de fecha optimizado
 * Usa useRef para evitar re-renders innecesarios
 */
export const DateFilterInput = React.memo(({
  label,
  value,
  onChange,
  className = ""
}: DateFilterInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="date"
          className="block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white pr-10"
          value={value}
          onChange={handleChange}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
      </div>
    </div>
  );
});

DateFilterInput.displayName = 'DateFilterInput';
