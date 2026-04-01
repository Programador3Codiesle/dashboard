'use client';

import React from 'react';

interface SelectSedeProps {
  value: string;
  onChange: (value: string) => void;
  includeTodas?: boolean;
  className?: string;
}

const SEDES = [
  { value: 'todas', label: 'Todas las sedes' },
  { value: '1', label: 'Girón' },
  { value: '11', label: 'Rosita' },
  { value: '9', label: 'Boconó' },
  { value: '21', label: 'Malecón' },
  { value: '22', label: 'Barranca' },
];

export const SelectSede: React.FC<SelectSedeProps> = ({
  value,
  onChange,
  includeTodas = false,
  className = '',
}) => {
  const options = includeTodas ? SEDES : SEDES.filter((s) => s.value !== 'todas');

  return (
    <select
      className={`w-full rounded-md border border-gray-300 bg-white text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((sede) => (
        <option key={sede.value} value={sede.value}>
          {sede.label}
        </option>
      ))}
    </select>
  );
};

