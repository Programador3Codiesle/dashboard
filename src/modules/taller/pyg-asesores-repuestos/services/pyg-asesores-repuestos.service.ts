import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import type { GenerarInformeParams, GenerarInformeResponse } from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/pyg-asesores-repuestos`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  try {
    const json = (await resp.json()) as { message?: string | string[] };
    const msg = Array.isArray(json.message) ? json.message[0] : json.message;
    throw new Error(msg || fallback);
  } catch (err) {
    if (err instanceof Error && err.message !== fallback) throw err;
    throw new Error(fallback);
  }
}

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
