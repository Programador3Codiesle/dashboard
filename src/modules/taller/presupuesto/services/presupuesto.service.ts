import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import { parseError } from "@/modules/taller/shared/utils/parse-api-error";
import type {
  ActualizarPresupuestoParams,
  CatalogosPresupuesto,
  ConsultarPresupuestoParams,
  ConsultarPresupuestoResponse,
} from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/presupuesto`;

export const presupuestoService = {
  async obtenerCatalogos(): Promise<CatalogosPresupuesto> {
    const resp = await fetchWithAuth(`${BASE}/catalogos`, { method: "GET" });
    if (!resp.ok) await parseError(resp, "No se pudieron cargar los catálogos");
    return resp.json();
  },

  async consultar(
    params: ConsultarPresupuestoParams,
  ): Promise<ConsultarPresupuestoResponse> {
    const resp = await fetchWithAuth(`${BASE}/consultar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!resp.ok) await parseError(resp, "No se pudo consultar el presupuesto");
    return resp.json();
  },

  async actualizar(params: ActualizarPresupuestoParams): Promise<{ message: string }> {
    const resp = await fetchWithAuth(`${BASE}/actualizar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!resp.ok) {
      await parseError(resp, "No se pudo actualizar el presupuesto");
    }
    return resp.json();
  },
};
