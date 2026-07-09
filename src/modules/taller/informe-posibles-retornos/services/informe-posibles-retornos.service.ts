import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import type {
  CatalogosInforme,
  GetGraficoParams,
  GraficoResponse,
} from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/informe-posibles-retornos`;

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

export const informePosiblesRetornosService = {
  async obtenerCatalogos(): Promise<CatalogosInforme> {
    const resp = await fetchWithAuth(`${BASE}/catalogos`, { method: "GET" });
    if (!resp.ok) {
      await parseError(resp, "No se pudieron cargar los catálogos");
    }
    return resp.json();
  },

  async obtenerGrafico(params: GetGraficoParams): Promise<GraficoResponse> {
    const body: Record<string, unknown> = { year: params.year };
    if (params.tecnico) body.tecnico = params.tecnico;
    if (params.sede) body.sede = params.sede;

    const resp = await fetchWithAuth(`${BASE}/grafico`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo generar el informe");
    }
    return resp.json();
  },
};
