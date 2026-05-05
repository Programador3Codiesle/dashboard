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
