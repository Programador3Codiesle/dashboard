/** API puede devolver ISO (`2026-07-05T00:00:00.000Z`) o `YYYY-MM-DD`. */
export function formatDateOnly(value: unknown, fallback = ''): string {
  if (value == null || value === '') return fallback;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return s;
}
