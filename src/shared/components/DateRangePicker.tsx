'use client';

import * as React from 'react';
import { DateRange } from 'react-day-picker';

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onChange({
      from: field === 'from' ? date : value?.from,
      to: field === 'to' ? date : value?.to,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        className="w-full rounded-md border-gray-300 text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
        value={value?.from ? value.from.toISOString().slice(0, 10) : ''}
        onChange={(e) => handleChange(e, 'from')}
      />
      <span className="text-xs text-gray-500">a</span>
      <input
        type="date"
        className="w-full rounded-md border-gray-300 text-sm px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-primary]"
        value={value?.to ? value.to.toISOString().slice(0, 10) : ''}
        onChange={(e) => handleChange(e, 'to')}
      />
    </div>
  );
};

