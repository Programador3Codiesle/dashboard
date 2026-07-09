import { formatDateOnly } from '@/modules/contact-center/shared/utils/format-date-only';
import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/contact-center/distribucion-agente`;

export type GaRow = {
  placa: string;
  nombrePropietario: string;
  modelo: string;
  campania: string;
  kmEstimado: number;
  fechaEstimada: string;
  estado: string;
};

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  throw new Error((json as { message?: string }).message || fallback);
}

function mapGaRow(row: Record<string, unknown>): GaRow {
  return {
    placa: String(row.placa ?? ''),
    nombrePropietario: String(row.nombre_propietario ?? row.nombrePropietario ?? ''),
    modelo: String(row.modelo ?? ''),
    campania: String(row.campania ?? ''),
    kmEstimado: Number(row.km_estimado ?? row.kmEstimado ?? 1000),
    fechaEstimada: formatDateOnly(row.fecha_estimada ?? row.fechaEstimada ?? ''),
    estado: String(row.estado ?? ''),
  };
}

export const distribucionAgenteService = {
  async gaActuales(): Promise<GaRow[]> {
    const resp = await fetchWithAuth(`${BASE}/ga-actuales`);
    if (!resp.ok) await parseError(resp, 'Error al cargar G.A. actuales');
    const json = await resp.json();
    return (Array.isArray(json) ? json : json.items ?? []).map(mapGaRow);
  },

  async gaFuturas(): Promise<GaRow[]> {
    return [];
  },

  async gaRecordacion(): Promise<GaRow[]> {
    return [];
  },
};
