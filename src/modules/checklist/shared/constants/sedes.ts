export const CHECKLIST_SEDES = [
  { value: 'Giron', label: 'Girón' },
  { value: 'Rosita', label: 'Rosita' },
  { value: 'Bocono', label: 'Bocono' },
  { value: 'Malecon', label: 'Malecón' },
  { value: 'Barranca', label: 'Barranca' },
  { value: 'Otra', label: 'Otra' },
] as const;

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
