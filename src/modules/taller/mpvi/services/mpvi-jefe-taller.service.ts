import { fetchWithAuth } from "@/utils/api";
import { getApiBaseUrl } from "@/config/public-env";
import type {
  MpviDatosServicioResponse,
  MpviGuardarServicioPayload,
  MpviGuardarServicioResponse,
  MpviObtenerDatosServicioPayload,
} from "../types";

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/taller/mpvi/jefe-taller`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  try {
    const json = (await resp.json()) as { message?: string };
    throw new Error(json.message || fallback);
  } catch (err) {
    if (err instanceof Error && err.message !== fallback) throw err;
    throw new Error(fallback);
  }
}

export const mpviJefeTallerService = {
  async obtenerDatosServicio(
    payload: MpviObtenerDatosServicioPayload,
  ): Promise<MpviDatosServicioResponse> {
    const resp = await fetchWithAuth(`${BASE}/datos-servicio`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudieron obtener los datos del servicio");
    }

    return resp.json();
  },

  async guardarServicio(
    payload: MpviGuardarServicioPayload,
  ): Promise<MpviGuardarServicioResponse> {
    const resp = await fetchWithAuth(`${BASE}/guardar-servicio`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      await parseError(resp, "No se pudo guardar el servicio");
    }

    return resp.json();
  },

  async obtenerPdfBlob(
    idCotizacion: number,
    tipo: number,
    empresa?: number,
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.set('tipo', String(tipo));
    if (empresa != null) params.set('empresa', String(empresa));
    const resp = await fetchWithAuth(`${BASE}/pdf/${idCotizacion}?${params}`, {
      method: 'GET',
    });

    if (!resp.ok) {
      await parseError(resp, 'No se pudo generar el PDF');
    }

    return resp.blob();
  },

  async abrirPdf(idCotizacion: number, tipo: number, empresa?: number): Promise<void> {
    const blob = await this.obtenerPdfBlob(idCotizacion, tipo, empresa);
    const url = URL.createObjectURL(blob);
    window.open(url, `MPVI-pdf-${tipo}`, 'status=0,title=0,height=600,width=800,scrollbars=1');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};
