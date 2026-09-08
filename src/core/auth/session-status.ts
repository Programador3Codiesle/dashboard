/** Fallos transitorios (deploy, Apache 502, rate limit). No son logout. */
export function isTransientHttpStatus(status: number): boolean {
  return (
    status === 408 ||
    status === 425 ||
    status === 429 ||
    status >= 500
  );
}

export function isUnauthorizedHttpStatus(status: number): boolean {
  return status === 401 || status === 403;
}

export type SessionAvailability = "authenticated" | "unauthenticated" | "unavailable";

export function sessionAvailabilityFromHttpStatus(
  status: number,
  ok: boolean,
): SessionAvailability {
  if (ok) return "authenticated";
  if (isUnauthorizedHttpStatus(status)) return "unauthenticated";
  return "unavailable";
}
