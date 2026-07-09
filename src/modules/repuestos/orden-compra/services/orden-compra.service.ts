import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/repuestos/orden-compra`;

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

export type OrdenCompraItem = {
  numeroOc: number;
  bodega: number;
  fechaOc: string;
  notas: string | null;
  codigo: string;
  repuesto: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  tipo: string | null;
  vendedor: string | null;
  ultimaCompra: string | null;
  ultimaVenta: string | null;
  giron: number;
  chevropartes: number;
  barranca: number;
  rosita: number;
  villa: number;
  solochevrolet: number;
  stockSeguridad: number;
  denegado: boolean;
  puedeAutorizar: boolean;
  autorizadoLabel: string;
};

export const ordenCompraService = {
  async listar(fechaIni: string, fechaFin: string) {
    const resp = await fetchWithAuth(`${BASE}/listar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaIni, fechaFin }),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo cargar órdenes');
    return resp.json() as Promise<{
      items: OrdenCompraItem[];
      presupuesto: number;
      compras: number;
      costoTotalAutorizado: number;
    }>;
  },

  async autorizar(items: Array<{ numeroOc: number; codigo: string }>) {
    const resp = await fetchWithAuth(`${BASE}/autorizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo autorizar');
    return resp.json();
  },

  async denegar(items: Array<{ numeroOc: number; codigo: string }>) {
    const resp = await fetchWithAuth(`${BASE}/denegar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo denegar');
    return resp.json();
  },

  async guardarPresupuesto(payload: {
    fechaMes: string;
    presupuesto?: number;
    compras?: number;
  }) {
    const resp = await fetchWithAuth(`${BASE}/presupuesto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo guardar presupuesto');
    return resp.json();
  },
};
