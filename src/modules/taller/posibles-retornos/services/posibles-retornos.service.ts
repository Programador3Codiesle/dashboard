import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import { parseError } from "@/modules/taller/shared/utils/parse-api-error";
import type {
  CatalogosPosiblesRetornos,
  DetallePlacaResponse,
  GuardarDefinicionParams,
  ListarParams,
  ListarResponse,
  SolucionRetorno,
} from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/posibles-retornos`;

export const posiblesRetornosService = {
  async obtenerCatalogos(): Promise<CatalogosPosiblesRetornos> {
    const resp = await fetchWithAuth(`${BASE}/catalogos`, { method: "GET" });
    if (!resp.ok) await parseError(resp, "No se pudieron cargar los catálogos");
    return resp.json();
  },

  async listar(params: ListarParams): Promise<ListarResponse> {
    const resp = await fetchWithAuth(`${BASE}/listar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!resp.ok) await parseError(resp, "No se pudo cargar el listado");
    return resp.json();
  },

  async obtenerDetalle(placa: string): Promise<DetallePlacaResponse> {
    const resp = await fetchWithAuth(`${BASE}/detalle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placa }),
    });
    if (!resp.ok) await parseError(resp, "No se ha encontrado información");
    return resp.json();
  },

  async guardarDefinicion(params: GuardarDefinicionParams): Promise<void> {
    const resp = await fetchWithAuth(`${BASE}/definicion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!resp.ok) {
      await parseError(resp, "No se ha podido guardar la información");
    }
  },

  async obtenerSolucion(numero: number): Promise<SolucionRetorno> {
    const resp = await fetchWithAuth(`${BASE}/solucion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numero }),
    });
    if (!resp.ok) await parseError(resp, "No se encontró solución");
    const json = (await resp.json()) as { solucion: SolucionRetorno };
    return json.solucion;
  },

  async cerrarBdc(idPosibleBdc: number): Promise<void> {
    const resp = await fetchWithAuth(`${BASE}/cerrar-bdc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idPosibleBdc }),
    });
    if (!resp.ok) {
      await parseError(resp, "No se ha podido cerrar el registro");
    }
  },
};
