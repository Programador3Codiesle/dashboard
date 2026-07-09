import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/repuestos/informe-ev-sv`;

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

export type InformeEvSvItem = {
  id: number;
  nOrden: number;
  placa: string | null;
  bodega: string | null;
  solicitadoPor: string | null;
  autorizadoPor: string | null;
  gestionRepuestos: Array<{
    ev: string;
    sv: string;
    otSv: string;
    pendiente: boolean;
  }>;
  gestionBodega: Array<{
    nOrden: number;
    entregados: number;
    noEntregados: number;
    pendiente: boolean;
  }>;
  colorEstado: 'amarillo' | 'morado' | 'rojo' | 'verde';
};

export const informeEvSvService = {
  async listarBodegas() {
    const resp = await fetchWithAuth(`${BASE}/bodegas`);
    if (!resp.ok) await parseError(resp, 'No se pudieron cargar bodegas');
    return resp.json();
  },

  async listar(filtros: Record<string, unknown>): Promise<InformeEvSvItem[]> {
    const resp = await fetchWithAuth(`${BASE}/listar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filtros),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo cargar el informe');
    return resp.json();
  },
};
