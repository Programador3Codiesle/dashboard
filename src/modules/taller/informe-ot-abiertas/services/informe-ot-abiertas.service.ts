import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import { parseError } from "@/modules/taller/shared/utils/parse-api-error";
import type {
  InformeGeneral,
  InformePorSede,
  InformePorTaller,
} from "../types/informe-ot-abiertas.types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/informe-ot-abiertas`;

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
