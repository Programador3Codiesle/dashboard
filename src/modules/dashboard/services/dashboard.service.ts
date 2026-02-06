import { fetchWithAuth } from "@/utils/api";
import type { DashboardData } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const resp = await fetchWithAuth(`${API_URL}/dashboard`, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error("No se pudo cargar el dashboard");
    }

    const data: DashboardData = await resp.json();
    return data;
  },
};
