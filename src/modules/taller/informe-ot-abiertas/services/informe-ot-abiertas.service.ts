import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import type {
  InformeGeneral,
  InformePorSede,
  InformePorTaller,
} from "../types/informe-ot-abiertas.types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/informe-ot-abiertas`;

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

export const informeOtAbiertasService = {
  async obtenerGeneral(): Promise<InformeGeneral> {
    const resp = await fetchWithAuth(`${BASE}/general`, { method: "GET" });
    if (!resp.ok) {
      await parseError(resp, "No se pudo cargar el informe general");
    }
    return resp.json();
  },

  async obtenerPorSede(sede: string): Promise<InformePorSede> {
    const resp = await fetchWithAuth(`${BASE}/sede/${encodeURIComponent(sede)}`, {
      method: "GET",
    });
    if (!resp.ok) {
      await parseError(resp, "No se pudo cargar el informe por sede");
    }
    return resp.json();
  },

  async obtenerPorTaller(bodegaId: number): Promise<InformePorTaller> {
    const resp = await fetchWithAuth(`${BASE}/taller/${bodegaId}`, {
      method: "GET",
    });
    if (!resp.ok) {
      await parseError(resp, "No se pudo cargar el informe por taller");
    }
    return resp.json();
  },
};
