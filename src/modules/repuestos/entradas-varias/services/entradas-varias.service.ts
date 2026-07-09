import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/repuestos/entradas-varias`;

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

export type OrdenTallerData = {
  bodega: number;
  descripcion: string;
  serie: string;
  placa: string | null;
};

export type RepuestoLinea = {
  referencia: string;
  descripcion: string;
  cantidad: number;
};

export const entradasVariasService = {
  async buscarOrden(nOrden: number): Promise<OrdenTallerData> {
    const resp = await fetchWithAuth(`${BASE}/orden`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nOrden }),
    });
    if (!resp.ok) await parseError(resp, 'No se encontró la orden');
    return resp.json();
  },

  async validarRepuesto(codigo: string) {
    const resp = await fetchWithAuth(`${BASE}/validar-repuesto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo }),
    });
    if (!resp.ok) await parseError(resp, 'Repuesto no válido');
    return resp.json() as Promise<{ codigo: string; descripcion: string }>;
  },

  async crearSolicitud(payload: {
    nOrden: number;
    obs: string;
    repuestos: Array<{ referencia: string; cantidad: number }>;
  }) {
    const resp = await fetchWithAuth(`${BASE}/solicitud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo guardar la solicitud');
    return resp.json() as Promise<{ idSolicitud: number; message: string }>;
  },
};
