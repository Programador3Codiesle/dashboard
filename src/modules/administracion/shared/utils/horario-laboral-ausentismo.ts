/** Equivale a Administracion::Ausentismo — vista 06:30–20:00. */
export function enHorarioLaboralAusentismo(now = new Date()): boolean {
  const mins = now.getHours() * 60 + now.getMinutes();
  const desde = 6 * 60 + 30;
  const hasta = 20 * 60;
  return mins > desde && mins < hasta;
}
