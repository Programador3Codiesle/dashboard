export function AdministracionQueryError({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_20%,white)] bg-[var(--color-danger-soft)] p-3 text-sm text-[var(--color-danger)]">
      {message}
    </p>
  );
}
