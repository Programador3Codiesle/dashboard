import { fetchWithAuth } from "@/utils/api";
import type { DashboardData } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const dashboardService = {
  async getDashboard(idsede?: number): Promise<DashboardData> {
    const url =
      idsede != null
        ? `${API_URL}/dashboard?idsede=${encodeURIComponent(idsede)}`
        : `${API_URL}/dashboard`;
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
