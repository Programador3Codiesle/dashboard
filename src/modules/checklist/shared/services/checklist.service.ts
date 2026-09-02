import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';
import { CHECKLIST_COPY } from '@/modules/checklist/constants';
import { parseError } from '../utils/parse-api-error';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/checklist`;

export type ChecklistTipo = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
    if (!resp.ok) await parseError(resp, CHECKLIST_COPY.saveError);
    return resp.json();
  },
};
