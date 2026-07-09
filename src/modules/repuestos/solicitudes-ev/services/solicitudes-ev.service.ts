import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/repuestos/solicitudes-ev`;

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

export type BodegaOption = { bodega: number; descripcion: string };

export type SolicitudEvItem = {
  id: number;
  nOrden: number;
  placa: string | null;
  bodega: string | null;
  fechaRegistro: string;
  solicitadoPor: string | null;
  obsRegistro: string;
  fechaAuth: string | null;
  autorizadoPor: string | null;
  obsAuth: string | null;
  estadoAuth: number | null;
  puedeGestionar: boolean;
};

export type DetalleLinea = {
  id: number;
  referencia: string;
  descripcion: string;
  cantidad: number;
  stock: Array<{ bodega: number; descripcion: string; stock: number }>;
  estadoAuth: number | null;
  puedeAutorizar: boolean;
  autorizacionLabel: string | null;
  numeroEv: string | null;
  numeroSv: string | null;
  obsEv: string | null;
  obsSv: string | null;
  entregado: string | number | null;
  puedeRegistrarEv: boolean;
  puedeRegistrarSv: boolean;
  puedeMarcarEntregado: boolean;
  colorFila: 'verde' | 'rojo' | 'neutral';
};

export const solicitudesEvService = {
  async listarBodegas(): Promise<BodegaOption[]> {
    const resp = await fetchWithAuth(`${BASE}/bodegas`);
    if (!resp.ok) await parseError(resp, 'No se pudieron cargar bodegas');
    return resp.json();
  },

  async listar(filtros: Record<string, unknown>): Promise<SolicitudEvItem[]> {
    const resp = await fetchWithAuth(`${BASE}/listar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filtros),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo cargar solicitudes');
    return resp.json();
  },

  async detalle(idSolicitud: number, modo: 0 | 1) {
    const resp = await fetchWithAuth(`${BASE}/detalle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idSolicitud, modo }),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo cargar el detalle');
    return resp.json() as Promise<{
      solicitud: { id: number; nOrden: number; bodega: number | null; estadoAuth: number | null };
      lineas: DetalleLinea[];
    }>;
  },

  async autorizar(payload: {
    idSolicitud: number;
    obsAuth: string;
    lineas: Array<{ idDetalle: number; estadoAuth: 1 | 2 }>;
  }) {
    const resp = await fetchWithAuth(`${BASE}/autorizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo autorizar');
    return resp.json();
  },

  async registrarEv(payload: Record<string, unknown>) {
    const resp = await fetchWithAuth(`${BASE}/entrada-varia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo registrar EV');
    return resp.json();
  },

  async registrarSv(payload: Record<string, unknown>) {
    const resp = await fetchWithAuth(`${BASE}/salida-varia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo registrar SV');
    return resp.json();
  },

  async marcarEntregado(idDetalle: number, idSolicitud: number) {
    const resp = await fetchWithAuth(`${BASE}/marcar-entregado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idDetalle, idSolicitud }),
    });
    if (!resp.ok) await parseError(resp, 'No se pudo marcar entregado');
    return resp.json();
  },
};
