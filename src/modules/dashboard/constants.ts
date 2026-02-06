/**
 * Perfiles con acceso al dashboard principal (legacy: admin.php / Informe_tecnicos / new_jefe_taller).
 * Si el perfil del usuario no está en esta lista, se muestra la vista empty.
 */
export const ALLOWED_DASHBOARD_PROFILES: number[] = [
  1, 20, 22, 23, 24, 28, 31, 32, 33, 34, 46,
];

export function isDashboardAllowedPerfil(perfil: string | number | undefined): boolean {
  if (perfil == null || perfil === '') return false;
  const n = typeof perfil === 'string' ? Number(perfil) : perfil;
  return Number.isFinite(n) && ALLOWED_DASHBOARD_PROFILES.includes(n);
}
