import axios from 'axios';

export async function parseError(
  resp: Response,
  fallback: string,
): Promise<never> {
  try {
    const json = (await resp.json()) as { message?: string | string[] };
    const msg = Array.isArray(json.message) ? json.message[0] : json.message;
    throw new Error(msg || fallback);
  } catch (err) {
    if (err instanceof Error && err.message !== fallback) throw err;
    throw new Error(fallback);
  }
}

function nestMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data as { message?: string | string[] } | undefined;
  const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
  return typeof msg === 'string' && msg.trim() ? msg.trim() : null;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return nestMessage(error) ||
    (error instanceof Error && error.message ? error.message : fallback);
}

export function isForbiddenError(error: unknown): boolean {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return true;
  }
  return getErrorMessage(error, '').toLowerCase().includes('no tiene permisos');
}
