import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const BASE = `${getApiBaseUrl()}/auditoria`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  const message = (json as { message?: string | string[] }).message;
  const text = Array.isArray(message) ? message.join(', ') : message;
  throw new Error(text || fallback);
}

export const auditoriaService = {
  async ordenesDiarias(fecha: string, bodega: string) {
    const resp = await fetchWithAuth(
      `${BASE}/ordenes-diarias?fecha=${encodeURIComponent(fecha)}&bodega=${encodeURIComponent(bodega)}`,
    );
    if (!resp.ok) await parseError(resp, 'Error al cargar órdenes diarias');
    return resp.json() as Promise<
      Array<{
        nombres: string;
        mantenimiento_preventivo: number;
        mantenimiento_correctivo: number;
        garantia: number;
        retorno: number;
        colision: number;
        interno: number;
      }>
    >;
  },

  async entregas(ano: number, tipo: 1 | 2) {
    const resp = await fetchWithAuth(
      `${BASE}/entregas?ano=${ano}&tipo=${tipo}`,
    );
    if (!resp.ok) await parseError(resp, 'Error al cargar entregas');
    return resp.json() as Promise<
      Array<{
        mes: number;
        entregas: number;
        segunda_entrega: number;
        promedio: number;
      }>
    >;
  },

  async facturacionTaller(bodega: string) {
    const resp = await fetchWithAuth(
      `${BASE}/facturacion-taller?bodega=${encodeURIComponent(bodega)}`,
    );
    if (!resp.ok) await parseError(resp, 'Error al cargar facturación taller');
    return resp.json();
  },

  async facturacionTecnico(params: { bodega?: string; tecnico?: string }) {
    const q = new URLSearchParams();
    if (params.bodega) q.set('bodega', params.bodega);
    if (params.tecnico) q.set('tecnico', params.tecnico);
    const resp = await fetchWithAuth(`${BASE}/facturacion-tecnico?${q}`);
    if (!resp.ok) await parseError(resp, 'Error al cargar facturación técnico');
    return resp.json();
  },

  async ordenesMttoPreventivo(bodega: string) {
    const resp = await fetchWithAuth(
      `${BASE}/ordenes-mtto-preventivo?bodega=${encodeURIComponent(bodega)}`,
    );
    if (!resp.ok) await parseError(resp, 'Error al cargar órdenes mtto');
    return resp.json();
  },

  async ordenesTecnicos(params: { bodega?: string; tecnico?: string }) {
    const q = new URLSearchParams();
    if (params.bodega) q.set('bodega', params.bodega);
    if (params.tecnico) q.set('tecnico', params.tecnico);
    const resp = await fetchWithAuth(`${BASE}/ordenes-tecnicos?${q}`);
    if (!resp.ok) await parseError(resp, 'Error al cargar órdenes técnicos');
    return resp.json();
  },

  async tecnicos() {
    const resp = await fetchWithAuth(`${BASE}/tecnicos`);
    if (!resp.ok) await parseError(resp, 'Error al cargar técnicos');
    return resp.json() as Promise<Array<{ nit: string; nombre: string }>>;
  },

  async npsFabricaSedes(fecha: string) {
    const resp = await fetchWithAuth(
      `${BASE}/nps-fabrica/sedes?fecha=${encodeURIComponent(fecha)}`,
    );
    if (!resp.ok) await parseError(resp, 'Error al cargar NPS sedes');
    return resp.json();
  },

  async npsFabricaTecnicos(fecha: string, sede?: string) {
    const q = new URLSearchParams({ fecha });
    if (sede) q.set('sede', sede);
    const resp = await fetchWithAuth(`${BASE}/nps-fabrica/tecnicos?${q}`);
    if (!resp.ok) await parseError(resp, 'Error al cargar NPS técnicos');
    return resp.json();
  },
};
