/** Solo rutas internas del dashboard. Evita abrir otro sitio desde `?next=`. */
export function rutaInternaDashboard(next: string | null | undefined): string {
  if (!next) return '/dashboard';
  if (!next.startsWith('/dashboard')) return '/dashboard';
  if (
    next.startsWith('//') ||
    next.includes('\\') ||
    next.includes('://') ||
    next.includes('..')
  ) {
    return '/dashboard';
  }
  return next;
}
