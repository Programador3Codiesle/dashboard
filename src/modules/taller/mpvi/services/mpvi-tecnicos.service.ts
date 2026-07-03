import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import type {
  MpviDatosResponse,
  MpviGuardarTecnicoPayload,
  MpviGuardarTecnicoResponse,
  MpviItemsResponse,
  MpviObtenerDatosPayload,
  MpviObtenerItemsPayload,
  MpviObtenerStockPayload,
  MpviStockResponse,
} from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/mpvi/tecnicos`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  try {
    const json = (await resp.json()) as { message?: string };
    throw new Error(json.message || fallback);
  } catch (err) {
    if (err instanceof Error && err.message !== fallback) throw err;
    throw new Error(fallback);
  }
}

export const mpviTecnicosService = {
  async obtenerItems(payload: MpviObtenerItemsPayload): Promise<MpviItemsResponse> {
    const resp = await fetchWithAuth(`${BASE}/items`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudieron obtener los ítems MPVI");
    }

    return resp.json();
  },

  async obtenerDatos(payload: MpviObtenerDatosPayload): Promise<MpviDatosResponse> {
    const resp = await fetchWithAuth(`${BASE}/datos`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudieron obtener los datos de cotización");
    }

    return resp.json();
  },

  async obtenerStock(payload: MpviObtenerStockPayload): Promise<MpviStockResponse> {
    const resp = await fetchWithAuth(`${BASE}/stock`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo consultar el stock");
    }

    return resp.json();
  },

  async guardarDatos(payload: MpviGuardarTecnicoPayload): Promise<MpviGuardarTecnicoResponse> {
    const resp = await fetchWithAuth(`${BASE}/guardar`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo guardar la cotización");
    }

    return resp.json();
  },

  async obtenerPdfBlob(idCotizacion: number, empresa?: number): Promise<Blob> {
    const qs = empresa != null ? `?empresa=${empresa}` : "";
    const resp = await fetchWithAuth(`${BASE}/pdf/${idCotizacion}${qs}`, {
      method: "GET",
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo generar el PDF");
    }

    return resp.blob();
  },

  async abrirPdf(idCotizacion: number, empresa?: number): Promise<void> {
    const blob = await this.obtenerPdfBlob(idCotizacion, empresa);
    const url = URL.createObjectURL(blob);
    window.open(url, "MPVI", "status=0,title=0,height=600,width=800,scrollbars=1");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};
