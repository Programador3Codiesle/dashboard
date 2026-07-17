import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const BASE = `${getApiBaseUrl()}/encuestas`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  const message = (json as { message?: string | string[] }).message;
  const text = Array.isArray(message) ? message.join(', ') : message;
  throw new Error(text || fallback);
}

export type SatisfaccionItem = {
  nit_real: string;
  nombres: string;
  numero: string;
  placa: string;
  fecha: string;
};

export type SatisfaccionDetalle = {
  orden: {
    cliente: string;
    nit_client: string;
    tecnico: string;
    descripcion: string;
    numero: string;
  } | null;
  respuestas: {
    pregunta1: string | number | null;
    pregunta2: string | number | null;
    pregunta3: string | number | null;
    pregunta4: string | number | null;
    pregunta5: string | number | null;
  } | null;
};

export type TecnicoNps = {
  nit: string;
  nombre: string;
  patio: string | null;
};

export const encuestasService = {
  async listarSatisfaccion(): Promise<SatisfaccionItem[]> {
    const resp = await fetchWithAuth(`${BASE}/satisfaccion`);
    if (!resp.ok) await parseError(resp, 'Error al cargar encuestas');
    return resp.json();
  },

  async detalleSatisfaccion(ot: string): Promise<SatisfaccionDetalle> {
    const resp = await fetchWithAuth(
      `${BASE}/satisfaccion/detalle?ot=${encodeURIComponent(ot)}`,
    );
    if (!resp.ok) await parseError(resp, 'Error al cargar detalle');
    return resp.json();
  },

  async listarTecnicos(): Promise<TecnicoNps[]> {
    const resp = await fetchWithAuth(`${BASE}/nps-colmotores/tecnicos`);
    if (!resp.ok) await parseError(resp, 'Error al cargar técnicos');
    return resp.json();
  },

  async insertNpsSede(body: {
    sede: string;
    fecha: string;
    calificacion: number;
    cal06: number;
    cal78: number;
    cal910: number;
  }) {
    const resp = await fetchWithAuth(`${BASE}/nps-colmotores/sede`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) await parseError(resp, 'Error al guardar NPS sede');
    return resp.json();
  },

  async insertNpsTecnico(body: {
    sede: string;
    tecnico: string;
    fecha: string;
    calificacion: number;
    placa: string;
    tipificacion: string;
    tipo_cal: '0a6' | '7a8' | '9a10';
  }) {
    const resp = await fetchWithAuth(`${BASE}/nps-colmotores/tecnico`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) await parseError(resp, 'Error al guardar NPS técnico');
    return resp.json();
  },

  async uploadNpsTecnicos(file: File): Promise<{ insertados: number; omitidos: number }> {
    const form = new FormData();
    form.append('fileContacts', file);
    const resp = await fetchWithAuth(`${BASE}/nps-tecnicos/upload`, {
      method: 'POST',
      body: form,
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar archivo');
    return resp.json();
  },

  plantillaUrl(): string {
    return `${BASE}/nps-tecnicos/plantilla`;
  },
};
