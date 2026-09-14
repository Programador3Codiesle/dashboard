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

const VENTAS_PROD_BASE = "https://intranet.codiesel.co/ventas";
const VENTAS_DEV_BASE = "http://localhost:8080/ventas";

/**
 * Base de la intranet de ventas (legado PHP: `inIntranetVentas`).
 * Override: `NEXT_PUBLIC_VENTAS_URL`. Dev: localhost:8080. Prod: intranet.codiesel.co.
 */
export function getVentasBaseUrl(): string {
  const override = process.env.NEXT_PUBLIC_VENTAS_URL?.trim();
  if (override) return normalizeBase(override);
  if (process.env.NODE_ENV === "production") {
    return VENTAS_PROD_BASE;
  }
  return VENTAS_DEV_BASE;
}

/** Login de ventas: prod `.../ventas/Login`, local `http://localhost:8080/ventas/Login`. */
export function getVentasLoginUrl(): string {
  return `${getVentasBaseUrl()}/Login`;
}

/**
 * Enlace del adjunto: el API decide nueva vs legado
 * (`GET /tickets/adjunto?file=`).
 */
export function resolveTicketPublicFileUrl(
  storedPath: string | null | undefined,
): string | null {
  if (!storedPath?.trim()) return null;
  const params = new URLSearchParams({ file: storedPath.trim() });
  return `${getApiBaseUrl()}/tickets/adjunto?${params.toString()}`;
}