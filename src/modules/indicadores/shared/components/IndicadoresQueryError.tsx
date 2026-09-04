export function IndicadoresQueryError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_20%,white)] bg-[var(--color-danger-soft)] p-3 text-sm text-[var(--color-danger)]">
      {message}
    </p>
  );
}

export function IndicadoresLoading({ message }: { message: string }) {
  return <p className="app-section-card text-sm text-gray-500">{message}</p>;
}
