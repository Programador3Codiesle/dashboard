import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/checklist`;

export type ChecklistTipo = 0 | 1 | 2 | 3 | 4 | 5 | 6;

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  throw new Error((json as { message?: string }).message || fallback);
}

export const checklistService = {
  async guardar(payload: {
    check: ChecklistTipo;
    data: Record<string, string | number | boolean>;
  }): Promise<{ ok: boolean; id: number }> {
    const resp = await fetchWithAuth(`${BASE}/guardar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'Error al guardar el checklist');
    return resp.json();
  },
};
