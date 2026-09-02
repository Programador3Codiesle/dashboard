import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';
import { parseError } from '@/modules/auditoria/shared/utils/parse-api-error';

const BASE = `${getApiBaseUrl()}/auditoria`;

export type OrdenDiariaRow = {
  nombres: string;
  mantenimiento_preventivo: number;
  mantenimiento_correctivo: number;
  garantia: number;
  retorno: number;
  colision: number;
  interno: number;
};

export type EntregaRow = {
  mes: number;
  entregas: number;
  segunda_entrega: number;
  promedio: number;
};

export type TecnicoOption = { nit: string; nombre: string };

export const auditoriaService = {
  async ordenesDiarias(fecha: string, bodega: string): Promise<OrdenDiariaRow[]> {
    const resp = await fetchWithAuth(
      `${BASE}/ordenes-diarias?fecha=${encodeURIComponent(fecha)}&bodega=${encodeURIComponent(bodega)}`,
    );
    if (!resp.ok) await parseError(resp, 'Error al cargar órdenes diarias');
    return resp.json();
  },

  async entregas(ano: number, tipo: 1 | 2): Promise<EntregaRow[]> {
    const resp = await fetchWithAuth(`${BASE}/entregas?ano=${ano}&tipo=${tipo}`);
    if (!resp.ok) await parseError(resp, 'Error al cargar entregas');
    return resp.json();
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

  async tecnicos(): Promise<TecnicoOption[]> {
    const resp = await fetchWithAuth(`${BASE}/tecnicos`);
    if (!resp.ok) await parseError(resp, 'Error al cargar técnicos');
    return resp.json();
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
