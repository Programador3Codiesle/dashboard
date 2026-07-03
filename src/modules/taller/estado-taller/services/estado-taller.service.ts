import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import type {
  AgregarEventoPayload,
  EstadoOtCatalogo,
  EstadoTallerPanel,
  FacturaMesActualPayload,
  HistorialOt,
  MutationResult,
  ValoresEstimadosPayload,
} from "../types/estado-taller.types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/estado-taller`;

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

export const estadoTallerService = {
  async obtenerPanel(
    bodega = "todas",
    idEmpresa?: number,
  ): Promise<EstadoTallerPanel> {
    const params = new URLSearchParams({ bodega });
    if (idEmpresa != null) {
      params.set("id_empresa", String(idEmpresa));
    }
    const resp = await fetchWithAuth(`${BASE}?${params.toString()}`, {
      method: "GET",
    });
    if (!resp.ok) {
      await parseError(resp, "No se pudo cargar el estado del taller");
    }
    return resp.json();
  },

  async obtenerTotalAbiertas(
    bodega = "todas",
    idEmpresa?: number,
  ): Promise<number> {
    const params = new URLSearchParams({ bodega });
    if (idEmpresa != null) {
      params.set("id_empresa", String(idEmpresa));
    }
    const resp = await fetchWithAuth(
      `${BASE}/total-abiertas?${params.toString()}`,
      { method: "GET" },
    );
    if (!resp.ok) {
      await parseError(resp, "No se pudo obtener el total de órdenes abiertas");
    }
    return resp.json();
  },

  async obtenerEstadosCatalogo(): Promise<EstadoOtCatalogo[]> {
    const resp = await fetchWithAuth(`${BASE}/estados`, { method: "GET" });
    if (!resp.ok) {
      await parseError(resp, "No se pudo cargar el catálogo de estados");
    }
    return resp.json();
  },

  async obtenerHistorial(numeroOrden: number): Promise<HistorialOt[]> {
    const resp = await fetchWithAuth(`${BASE}/historial/${numeroOrden}`, {
      method: "GET",
    });
    if (!resp.ok) {
      await parseError(resp, "No se pudo cargar el historial de la orden");
    }
    return resp.json();
  },

  async obtenerCotizacionesSacyr(numeroOrden: number): Promise<number[]> {
    const resp = await fetchWithAuth(
      `${BASE}/cotizaciones-sacyr/${numeroOrden}`,
      { method: "GET" },
    );
    if (!resp.ok) {
      await parseError(resp, "No se pudieron cargar las cotizaciones Sacyr");
    }
    return resp.json();
  },

  async agregarEvento(payload: AgregarEventoPayload): Promise<{ ok: boolean }> {
    const resp = await fetchWithAuth(`${BASE}/evento`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      await parseError(resp, "No se pudo agregar el evento");
    }
    return resp.json();
  },

  async guardarFacturaMesActual(
    payload: FacturaMesActualPayload,
  ): Promise<MutationResult> {
    const resp = await fetchWithAuth(`${BASE}/factura-mes-actual`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      await parseError(resp, "No se pudo registrar la factura del mes");
    }
    return resp.json();
  },

  async guardarValoresEstimados(
    payload: ValoresEstimadosPayload,
  ): Promise<MutationResult> {
    const resp = await fetchWithAuth(`${BASE}/valores-estimados`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      await parseError(resp, "No se pudieron guardar los valores estimados");
    }
    return resp.json();
  },
};
