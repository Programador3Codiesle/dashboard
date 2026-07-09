import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/contact-center/distribucion`;

export type AgenteDistribucion = { nombres: string; nitReal: number };
export type BodegaDistribucion = { bodega: number; descripcion?: string };
export type CeldaDistribucion = {
  agente: number;
  bodega: number;
  asignado: boolean;
  distribucion: number | null;
};
export type TotalBodega = { bodega: number; distSede: number };

export type MatrizDistribucion = {
  mes: number;
  anio: number;
  agentes: AgenteDistribucion[];
  bodegas: BodegaDistribucion[];
  celdas: CeldaDistribucion[];
};

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  throw new Error((json as { message?: string }).message || fallback);
}

function mapAgente(row: Record<string, unknown>): AgenteDistribucion {
  return {
    nombres: String(row.nombres ?? ''),
    nitReal: Number(row.nit_real ?? row.nitReal ?? 0),
  };
}

function mapBodega(row: Record<string, unknown>): BodegaDistribucion {
  return {
    bodega: Number(row.bodega ?? 0),
    descripcion: row.descripcion != null ? String(row.descripcion) : undefined,
  };
}

export const distribucionService = {
  async obtenerMatriz(): Promise<MatrizDistribucion> {
    const resp = await fetchWithAuth(`${BASE}/matriz`);
    if (!resp.ok) await parseError(resp, 'Error al cargar matriz');
    const json = await resp.json();
    return {
      mes: Number(json.mes),
      anio: Number(json.anio),
      agentes: (json.agentes ?? []).map(mapAgente),
      bodegas: (json.bodegas ?? []).map(mapBodega),
      celdas: (json.celdas ?? json.asignaciones ?? []).map(
        (c: Record<string, unknown>) => ({
        agente: Number(c.agente),
        bodega: Number(c.bodega),
        asignado: Boolean(c.asignado),
        distribucion: c.distribucion != null ? Number(c.distribucion) : null,
      }),
      ),
    };
  },

  async obtenerTotales(): Promise<TotalBodega[]> {
    const resp = await fetchWithAuth(`${BASE}/totales`);
    if (!resp.ok) await parseError(resp, 'Error al cargar totales');
    const json = await resp.json();
    return (Array.isArray(json) ? json : json.totales ?? []).map(
      (t: Record<string, unknown>) => ({
        bodega: Number(t.bodega),
        distSede: Number(t.dist_sede ?? t.distSede ?? 0),
      }),
    );
  },

  async toggle(payload: { agente: number; bodega: number; activo: boolean }) {
    const resp = await fetchWithAuth(`${BASE}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'Error al actualizar asignación');
    return resp.json();
  },

  async updateDistribucion(payload: {
    agente: number;
    bodega: number;
    distribucion: number;
  }) {
    const resp = await fetchWithAuth(`${BASE}/update-distribucion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'Error al actualizar distribución');
    return resp.json();
  },
};
