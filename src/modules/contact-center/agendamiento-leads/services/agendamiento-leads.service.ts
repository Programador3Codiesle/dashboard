import { formatDateOnly } from '@/modules/contact-center/shared/utils/format-date-only';
import { parseError } from '@/modules/contact-center/shared/utils/parse-api-error';
import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/contact-center/agendamiento-leads`;

export type LeadItem = {
  idcontactlead: number;
  documento: string;
  nombres: string;
  vhinteres: string;
  fecha: string;
  ciudad: string;
  telefonos: string;
  email: string;
  placa: string;
  lead?: string;
  agencia?: string;
  idagente?: number;
  agenteNombre?: string;
  interesado?: boolean;
  resultado?: string;
  fechaGestionado?: string;
};

export type MotivoNoAgendamiento = { id: number; motivo: string };

export type AgenteAsignacion = { id: number; nombre: string };

function mapLead(row: Record<string, unknown>): LeadItem {
  return {
    idcontactlead: Number(row.idcontactlead ?? 0),
    documento: String(row.documento ?? ''),
    nombres: String(row.nombres ?? ''),
    vhinteres: String(row.vhinteres ?? ''),
    fecha: formatDateOnly(row.fecha ?? ''),
    ciudad: String(row.ciudad ?? ''),
    telefonos: String(row.telefonos ?? ''),
    email: String(row.email ?? ''),
    placa: String(row.placa ?? ''),
    lead: row.lead != null ? String(row.lead) : undefined,
    agencia: row.agencia != null ? String(row.agencia) : undefined,
    idagente: row.idagente != null ? Number(row.idagente) : undefined,
    agenteNombre: row.agenteNombre != null ? String(row.agenteNombre) : undefined,
    interesado: row.interesado != null ? Boolean(row.interesado) : undefined,
    resultado: row.resultado != null ? String(row.resultado) : undefined,
    fechaGestionado:
      row.fecha_gestionado != null
        ? formatDateOnly(row.fecha_gestionado)
        : row.fechaGestionado != null
          ? formatDateOnly(row.fechaGestionado)
          : undefined,
  };
}

export const agendamientoLeadsService = {
  async listar(payload: {
    tipoLeads?: string;
    fechaIni?: string;
    fechaFin?: string;
  }): Promise<LeadItem[]> {
    const resp = await fetchWithAuth(`${BASE}/listar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoLeads: payload.tipoLeads,
        fecha_ini: payload.fechaIni,
        fecha_fin: payload.fechaFin,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al listar leads');
    const json = await resp.json();
    return (Array.isArray(json) ? json : json.items ?? []).map(mapLead);
  },

  async asignar(payload: { idleads: number[]; agente: number }) {
    const resp = await fetchWithAuth(`${BASE}/asignar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idleads: payload.idleads.join('_'),
        agente: payload.agente,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al asignar leads');
    return resp.json();
  },

  async gestionar(payload: {
    idcontactlead: number;
    interesado: '0' | '1';
    idcita?: string;
    motivo?: string;
  }) {
    const resp = await fetchWithAuth(`${BASE}/gestionar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idcontactlead: payload.idcontactlead,
        interesado: Number(payload.interesado),
        ...(payload.idcita ? { idcita: Number(payload.idcita) } : {}),
        ...(payload.motivo ? { motivo: Number(payload.motivo) } : {}),
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al registrar gestión');
    return resp.json();
  },

  async listarMotivos(): Promise<MotivoNoAgendamiento[]> {
    const resp = await fetchWithAuth(`${BASE}/motivos`);
    if (!resp.ok) await parseError(resp, 'Error al cargar motivos');
    const json = await resp.json();
    return (Array.isArray(json) ? json : json.motivos ?? []).map(
      (m: Record<string, unknown>) => ({
        id: Number(m.id),
        motivo: String(m.motivo ?? ''),
      }),
    );
  },

  async listarAgentesAsignacion(): Promise<AgenteAsignacion[]> {
    const resp = await fetchWithAuth(`${BASE}/agentes-asignacion`);
    if (!resp.ok) await parseError(resp, 'Error al cargar agentes');
    const json = await resp.json();
    return (Array.isArray(json) ? json : json.agentes ?? []).map(
      (a: Record<string, unknown>) => ({
        id: Number(a.id_usuario ?? a.id ?? 0),
        nombre: String(a.nombres ?? a.nombre ?? ''),
      }),
    );
  },

  async exportarExcel(): Promise<Blob> {
    const resp = await fetchWithAuth(`${BASE}/export`);
    if (!resp.ok) await parseError(resp, 'Error al exportar leads');
    return resp.blob();
  },
};
