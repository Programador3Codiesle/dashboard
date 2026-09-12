import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import { parseError } from "@/modules/taller/shared/utils/parse-api-error";
import type { RankingTrimestralResponse } from "../types";

const BASE = `${getApiBaseUrl()}/taller/ranking-trimestral`;

export const rankingTrimestralService = {
  async listar(
    ano: number,
    trimestre: 1 | 2 | 3 | 4,
  ): Promise<RankingTrimestralResponse> {
    const params = new URLSearchParams({
      ano: String(ano),
      trimestre: String(trimestre),
    });
    const resp = await fetchWithAuth(`${BASE}?${params}`);
    if (!resp.ok) {
      await parseError(resp, "No se pudo cargar el ranking trimestral");
    }
    return resp.json();
  },
};
