import { fetchWithAuth } from "@/utils/api";
import type { DashboardData } from "../types";
import { getApiBaseUrl } from "@/config/public-env";

const API_URL = getApiBaseUrl();

export const dashboardService = {
  async getDashboard(params?: {
    idsede?: number;
    mes?: number;
    ano?: number;
    empresa?: number;
  }): Promise<DashboardData> {
    const search = new URLSearchParams();
    if (params?.idsede != null) {
      search.set("idsede", String(params.idsede));
    }
    if (params?.mes != null) {
      search.set("mes", String(params.mes));
    }
    if (params?.ano != null) {
      search.set("ano", String(params.ano));
    }
    if (params?.empresa != null && Number.isFinite(params.empresa)) {
      search.set("empresa", String(params.empresa));
    }
    const query = search.toString();
    const url = query ? `${API_URL}/dashboard?${query}` : `${API_URL}/dashboard`;
    const resp = await fetchWithAuth(url, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error("No se pudo cargar el dashboard");
    }

    const data: DashboardData = await resp.json();
    return data;
  },
};
