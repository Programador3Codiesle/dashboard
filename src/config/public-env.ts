const DEV_API_DEFAULT = "http://localhost:4000";

function normalizeBase(url: string): string {
  return url.replace(/\/+$/, "");
}
/** Base URL del backend para llamadas desde el navegador (axios/fetch). */
export function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (url?.trim()) return normalizeBase(url.trim());
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_API_URL es obligatoria en producción (configúrela en el build o en el entorno).",
    );
  }
  return DEV_API_DEFAULT;
}

/**
 * URL pública del API para enlaces absolutos (PDF, assets). Si no está definida,
 * coincide con getApiBaseUrl().
 */
export function getApiPublicUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_PUBLIC_URL;
  if (url?.trim()) return normalizeBase(url.trim());
  return getApiBaseUrl();
}

/**
 * URL absoluta para adjuntos de tickets (`/uploads/tickets/...` en BD).
 * Los archivos viven en el `public` del **Nest** (dev y prod); usa `getApiPublicUrl`.
 * Si el valor guardado era una URL absoluta solo con pathname `/uploads/...`, se reescribe al API.
 */
export function resolveTicketPublicFileUrl(
  storedPath: string | null | undefined,
): string | null {
  if (!storedPath?.trim()) return null;
  const s = storedPath.trim();

  let path = s;
  let suffix = "";
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      path = u.pathname;
      suffix = `${u.search}${u.hash}`;
    } catch {
      path = s.startsWith("/") ? s : `/${s}`;
    }
  } else {
    path = s.startsWith("/") ? s : `/${s}`;
  }

  if (!path.startsWith("/uploads/")) {
    if (/^https?:\/\//i.test(s)) return s;
    return `${getApiPublicUrl()}${path}${suffix}`;
  }

  const base = getApiPublicUrl();
  return `${base}${path}${suffix}`;
}