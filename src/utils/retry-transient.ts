/** Hueco típico de Apache/PM2 (worker caído o aún no listo). No incluye 500 de negocio. */
export function isGatewayGapHttpStatus(status: number): boolean {
  return (
    status === 408 ||
    status === 429 ||
    status === 502 ||
    status === 503 ||
    status === 504
  );
}

export const TRANSIENT_RETRY_MAX = 5;

export function isIdempotentHttpMethod(method?: string): boolean {
  const m = (method || "GET").toUpperCase();
  return m === "GET" || m === "HEAD" || m === "OPTIONS";
}

export function transientRetryDelayMs(attemptIndex: number): number {
  return Math.min(400 * 2 ** attemptIndex, 4000);
}

export function shouldRetryTransientHttp(
  status: number,
  attemptIndex: number,
  maxAttempts: number = TRANSIENT_RETRY_MAX,
): boolean {
  return isGatewayGapHttpStatus(status) && attemptIndex < maxAttempts - 1;
}

export function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
