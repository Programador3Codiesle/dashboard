import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import { parseError } from "@/modules/taller/shared/utils/parse-api-error";
import type { GenerarInformeParams, GenerarInformeResponse } from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/pyg-asesores-repuestos`;

export const pygAsesoresRepuestosService = {
  async generar(params: GenerarInformeParams): Promise<GenerarInformeResponse> {
    const resp = await fetchWithAuth(`${BASE}/generar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo generar el informe");
    }

    return resp.json();
  },
};
