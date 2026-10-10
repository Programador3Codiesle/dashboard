/** YYYY-MM-DD del calendario local. Evita que toISOString pase al día siguiente después de las 19:00. */
export function fechaLocalYmd(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
