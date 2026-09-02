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
