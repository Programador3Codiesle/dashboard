export function MantenimientoInfoChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 shadow-sm ${
        tone ?? 'border-gray-100 bg-white'
      }`}
    >
      <p
        className={`text-[11px] font-semibold uppercase tracking-wide ${
          tone ? 'opacity-70' : 'text-gray-500'
        }`}
      >
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-medium ${tone ? '' : 'text-gray-900'}`}>
        {value || '—'}
      </p>
    </div>
  );
}
