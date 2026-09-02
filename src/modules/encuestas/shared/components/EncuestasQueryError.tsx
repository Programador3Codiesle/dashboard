export function EncuestasQueryError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_20%,white)] bg-[var(--color-danger-soft)] p-3 text-sm text-[var(--color-danger)]">
      {message}
    </p>
  );
}

export function EncuestasLoading({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-500 shadow-sm">
      {message}
    </p>
  );
}
