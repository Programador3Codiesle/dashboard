/**
 * Debe coincidir con `basePath` / `assetPrefix` en `next.config.ts`.
 * Dev: cadena vacía. Producción: `/postventa2`.
 */
export const NEXT_APP_BASE_PATH_PRODUCTION = "/postventa2";

export function getNextBasePath(): string {
  return process.env.NODE_ENV === "production"
    ? NEXT_APP_BASE_PATH_PRODUCTION
    : "";
}

/**
 * Antepone el basePath de Next a rutas relativas del sitio (p. ej. `/api/...`, `/uploads/...`).
 * URLs absolutas `http(s)://` se devuelven igual salvo corrección de adjuntos legacy (mismo host, `/uploads` sin basePath).
 */
export function withNextBasePath(path: string): string {
  const base = getNextBasePath();
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) {
    try {
      const parsed = new URL(path);
      if (
        base &&
        parsed.pathname.startsWith("/uploads/") &&
        !parsed.pathname.startsWith(`${base}/`)
      ) {
        return `${parsed.origin}${base}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      /* ignore */
    }
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!base) return normalized;
  if (normalized === base || normalized.startsWith(`${base}/`)) {
    return normalized;
  }
  return `${base}${normalized}`;
}
