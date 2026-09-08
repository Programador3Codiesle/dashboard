/**
 * Carpeta de salida de Next. Por defecto `.next` (dev, start, build normal).
 * En el servidor: NEXT_DIST_DIR=.next-build para construir sin pisar el front vivo.
 */
export function getNextDistDir(): string {
  const raw = process.env.NEXT_DIST_DIR?.trim();
  if (!raw) return ".next";
  if (raw === ".next" || raw === ".next-build") return raw;
  throw new Error(
    'NEXT_DIST_DIR solo admite ".next" o ".next-build".',
  );
}
