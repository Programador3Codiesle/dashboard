import { getNextBasePath } from "./next-base-path";

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
 * URL para abrir adjuntos de tickets (`/uploads/tickets/...` en BD).
 * - **Desarrollo**: archivos en `public` del Next → mismo origen del navegador + `basePath`.
 * - **Producción**: archivos en `public` del Nest → URL del API (`getApiPublicUrl`).
 * Corrige enlaces viejos en dev que apuntaban por error a `localhost:4000/uploads/...`.
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

  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    return `${window.location.origin}${getNextBasePath()}${path}${suffix}`;
  }

  const base = getApiPublicUrl();
  return `${base}${path}${suffix}`;
}