'use client';

import { Upload } from 'lucide-react';

export function MantenimientoFileField({
  label,
  file,
  accept,
  placeholder,
  onChange,
}: {
  label: string;
  file: File | null;
  accept?: string;
  placeholder?: string;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-3 transition-colors hover:border-[var(--color-warning)] hover:bg-[var(--color-warning-soft)]">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--color-primary) text-white">
          <Upload className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-gray-800">
            {file ? 'Archivo seleccionado' : 'Seleccionar archivo'}
          </span>
          <span className="block truncate text-xs text-gray-500">
            {file ? file.name : (placeholder ?? 'Haz clic para buscar en tu equipo')}
          </span>
        </span>
        <input
          type="file"
          className="sr-only"
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}
