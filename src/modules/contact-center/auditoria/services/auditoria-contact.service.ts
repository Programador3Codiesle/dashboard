import { getApiBaseUrl, getApiPublicUrl } from '@/config/public-env';
import { formatDateOnly } from '@/modules/contact-center/shared/utils/format-date-only';
import { fetchWithAuth } from '@/utils/api';

const API_URL = getApiBaseUrl();
const BASE = `${API_URL}/contact-center/auditoria-contact`;

export type AgenteAuditoria = { nit: number; nombres: string };

export type ItemAuditoria = {
  idItem: number;
  concepto: string;
  respuesta: 1 | 2 | 3 | null;
  puntosSi: number;
};

export type IndicadorAuditoria = {
  idIndicador: number;
  nombres: string;
  puntuacion: number;
  estado: number;
  items: ItemAuditoria[];
};

export type FormularioAuditoria = {
  idAuditoria?: number;
  indicadores: IndicadorAuditoria[];
  cantPreguntas: number;
};

export type AuditoriaListItem = {
  idAuditoria: number;
  nit: number;
  nombre: string;
  puntuacion: number;
  fechaCreacion: string;
  fechaFinalizacion: string | null;
  compromiso: string | null;
  estado: 'finalizada' | 'pendiente_compromiso' | 'en_progreso';
  puedeEditar: boolean;
  puedeVer: boolean;
  puedeEnviarEmail: boolean;
};

export type AuditoriaDetalle = FormularioAuditoria & {
  nitAgente: number;
  nombres: string;
  puntuacion: number | null;
  compromiso: string | null;
  observaciones: string | null;
  puedeAgregarCompromiso: boolean;
  archivos: { url: string; nombre: string }[];
};

export type IndicadorConfig = {
  idIndicador: number;
  nombres: string;
  puntuacion: number;
  estado: number;
  accionEstado?: string;
  nuevoEstado?: number;
};

export type ItemConfig = {
  idItem: number;
  concepto: string;
  estado: number;
  accionEstado?: string;
  nuevoEstado?: number;
};

export type ObservacionConfig = {
  idObs: number;
  observacion: string;
  estado: number;
  accionEstado?: string;
  nuevoEstado?: number;
};

export type InformeDetalleRow = {
  fecha: string;
  puntos: number | null;
  idAuditoria: number;
  puedeVer: boolean;
  puedeEditar: boolean;
};

export type InformeDetalleResult = {
  filas: InformeDetalleRow[];
  promedio?: number;
  sumaPuntos?: number;
  cantidad?: number;
  mensaje?: string;
};

export type ContextoListado = {
  esAdmin: boolean;
  esAgente: boolean;
};

export type IndicadorPuntosRow = {
  idIndicador: number;
  nombres: string;
  puntuacion: number;
  editable: boolean;
};

export type IndicadoresPuntosResponse = {
  indicadores: IndicadorPuntosRow[];
  sumaPuntos: number;
  estadoIndCambiar: number;
  idIndicadorCambiar: number;
};

export type UploadResult = {
  cantSaveFile: string[];
  cantNotSaveFile: string[];
};

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  throw new Error((json as { message?: string }).message || fallback);
}

function resolveAuditoriaFileUrl(storedPath: string): string {
  if (/^https?:\/\//i.test(storedPath)) return storedPath;
  const path = storedPath.startsWith('/') ? storedPath : `/${storedPath}`;
  return `${getApiPublicUrl()}${path}`;
}

function mapIndicadoresFormulario(
  indicadores: Array<Record<string, unknown>> | undefined,
): IndicadorAuditoria[] {
  return (indicadores ?? []).map((ind) => ({
    idIndicador: Number(ind.idIndicador ?? ind.id_indicador ?? 0),
    nombres: String(ind.nombre ?? ind.nombres ?? ''),
    puntuacion: Number(ind.puntuacion ?? 0),
    estado: Number(ind.estado ?? 2),
    items: ((ind.items as Array<Record<string, unknown>>) ?? []).map((it) => ({
      idItem: Number(it.idItem ?? it.id_item ?? 0),
      concepto: String(it.concepto ?? ''),
      respuesta:
        it.respuesta != null && it.respuesta !== ''
          ? (Number(it.respuesta) as 1 | 2 | 3)
          : null,
      puntosSi: Number(it.puntosPorItem ?? it.puntosSi ?? 0),
    })),
  }));
}

function mapFormulario(raw: Record<string, unknown>): FormularioAuditoria {
  return {
    idAuditoria: raw.id_auditoria != null ? Number(raw.id_auditoria) : undefined,
    cantPreguntas: Number(raw.cantPreguntas ?? 0),
    indicadores: mapIndicadoresFormulario(
      raw.indicadores as Array<Record<string, unknown>> | undefined,
    ),
  };
}

function mapAuditoriaDetalle(raw: Record<string, unknown>): AuditoriaDetalle {
  const form = mapFormulario(raw);
  return {
    ...form,
    idAuditoria: Number(raw.id_auditoria ?? form.idAuditoria ?? 0),
    nitAgente: Number(raw.nit_agente ?? 0),
    nombres: String(raw.nombres ?? ''),
    puntuacion:
      raw.puntuacion != null && raw.puntuacion !== ''
        ? Number(raw.puntuacion)
        : null,
    compromiso: raw.compromiso != null ? String(raw.compromiso) : null,
    observaciones: raw.observaciones != null ? String(raw.observaciones) : null,
    puedeAgregarCompromiso: Boolean(raw.puedeAgregarCompromiso),
    archivos: ((raw.archivos as Array<Record<string, unknown>>) ?? []).map(
      (f) => ({
        url: resolveAuditoriaFileUrl(String(f.url ?? '')),
        nombre: String(f.nombre ?? ''),
      }),
    ),
  };
}

function mapListItem(row: Record<string, unknown>): AuditoriaListItem {
  return {
    idAuditoria: Number(row.id_auditoria ?? row.idAuditoria ?? 0),
    nit: Number(row.nit_agente ?? row.nit ?? 0),
    nombre: String(row.nombres ?? row.nombre ?? ''),
    puntuacion: Number(row.puntuacion ?? 0),
    fechaCreacion: formatDateOnly(row.fecha_creacion ?? row.fechaCreacion ?? ''),
    fechaFinalizacion:
      row.fecha_finalizacion != null && row.fecha_finalizacion !== ''
        ? formatDateOnly(row.fecha_finalizacion ?? row.fechaFinalizacion)
        : null,
    compromiso: row.compromiso != null ? String(row.compromiso) : null,
    estado: (row.estado as AuditoriaListItem['estado']) ?? 'en_progreso',
    puedeEditar: Boolean(row.puedeEditar),
    puedeVer: Boolean(row.puedeVer),
    puedeEnviarEmail: Boolean(row.puedeEnviarEmail),
  };
}

export const auditoriaContactService = {
  async obtenerContexto(): Promise<ContextoListado> {
    const resp = await fetchWithAuth(`${BASE}/contexto`);
    if (!resp.ok) await parseError(resp, 'Error al cargar contexto');
    return resp.json();
  },

  async listarAgentes(): Promise<AgenteAuditoria[]> {
    const resp = await fetchWithAuth(`${BASE}/agentes`);
    if (!resp.ok) await parseError(resp, 'Error al cargar agentes');
    const json = await resp.json();
    return (Array.isArray(json) ? json : json.agentes ?? []).map(
      (a: Record<string, unknown>) => ({
        nit: Number(a.nit ?? a.nit_real ?? 0),
        nombres: String(a.nombres ?? ''),
      }),
    );
  },

  async crearAuditoria(nitAgente: number): Promise<number> {
    const resp = await fetchWithAuth(`${BASE}/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nitAgente }),
    });
    if (!resp.ok) await parseError(resp, 'Error al crear auditoría');
    const json = await resp.json();
    return Number(json.id_auditoria ?? json.idAuditoria ?? 0);
  },

  async cargarFormulario(opcion?: string): Promise<FormularioAuditoria> {
    const resp = await fetchWithAuth(`${BASE}/formulario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opcion ? { opcion } : {}),
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar formulario');
    const json = await resp.json();
    return mapFormulario(json);
  },

  async cargarFormularioVistaPrevia(): Promise<FormularioAuditoria> {
    const resp = await fetchWithAuth(`${BASE}/formulario-vista-previa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar vista previa');
    const json = await resp.json();
    return mapFormulario(json);
  },

  async updateRespuesta(payload: {
    idAuditoria: number;
    item: number;
    opt: 1 | 2 | 3;
  }) {
    const resp = await fetchWithAuth(`${BASE}/update-respuesta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_auditoria: payload.idAuditoria,
        item: payload.item,
        opt: payload.opt,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al guardar respuesta');
    return resp.json();
  },

  async finalizarAuditoria(payload: {
    idAuditoria: number;
    obsAuditor: string;
  }): Promise<number> {
    const resp = await fetchWithAuth(`${BASE}/finalizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_auditoria: payload.idAuditoria,
        obsAuditor: payload.obsAuditor,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al finalizar auditoría');
    const json = await resp.json();
    return Number(json.id_auditoria ?? json.idAuditoria ?? 0);
  },

  async subirArchivos(
    idAuditoria: number,
    archivos: File[],
  ): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('id_auditoria', String(idAuditoria));
    archivos.forEach((file) => formData.append('files', file));

    const resp = await fetchWithAuth(`${BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!resp.ok) await parseError(resp, 'Error al subir archivos');
    const json = await resp.json();
    return {
      cantSaveFile: (json.cantSaveFile as string[]) ?? [],
      cantNotSaveFile: (json.cantNotSaveFile as string[]) ?? [],
    };
  },

  async listarAuditorias(
    esAdmin: boolean,
    nitAgente?: number,
  ): Promise<AuditoriaListItem[]> {
    const endpoint = esAdmin ? 'listar-admin' : 'listar-agente';
    const resp = await fetchWithAuth(`${BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(esAdmin && nitAgente ? { nitAgente } : {}),
    });
    if (!resp.ok) await parseError(resp, 'Error al listar auditorías');
    const json = await resp.json();
    return (Array.isArray(json) ? json : []).map((row: Record<string, unknown>) =>
      mapListItem(row),
    );
  },

  async verAuditoria(
    idAuditoria: number,
    modo: 'admin' | 'agente' | 'editar' = 'admin',
  ): Promise<AuditoriaDetalle> {
    const endpoint =
      modo === 'editar'
        ? 'editar'
        : modo === 'agente'
          ? 'ver-agente'
          : 'ver-admin';
    const resp = await fetchWithAuth(`${BASE}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_auditoria: idAuditoria }),
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar auditoría');
    const json = await resp.json();
    return mapAuditoriaDetalle(json);
  },

  async guardarCompromiso(payload: {
    idAuditoria: number;
    compromisos: string;
  }) {
    const resp = await fetchWithAuth(`${BASE}/compromiso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_auditoria: payload.idAuditoria,
        compromisos: payload.compromisos,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al guardar compromiso');
    return resp.json();
  },

  async enviarEmail(idAuditoria: number) {
    const resp = await fetchWithAuth(`${BASE}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_auditoria: idAuditoria }),
    });
    if (!resp.ok) await parseError(resp, 'Error al enviar email');
    return resp.json();
  },

  async listarIndicadores(): Promise<IndicadorConfig[]> {
    const resp = await fetchWithAuth(`${BASE}/indicadores`);
    if (!resp.ok) await parseError(resp, 'Error al cargar indicadores');
    const json = await resp.json();
    return (Array.isArray(json) ? json : json.indicadores ?? []).map(
      (i: Record<string, unknown>) => ({
        idIndicador: Number(i.id_indicador ?? i.idIndicador ?? 0),
        nombres: String(i.nombres ?? ''),
        puntuacion: Number(i.puntuacion ?? 0),
        estado: Number(i.estado ?? 0),
        accionEstado: i.accionEstado != null ? String(i.accionEstado) : undefined,
        nuevoEstado:
          i.nuevoEstado != null ? Number(i.nuevoEstado) : undefined,
      }),
    );
  },

  async validarAuditoriasPendientes(): Promise<number> {
    const resp = await fetchWithAuth(`${BASE}/validate-cant-auditorias`);
    if (!resp.ok) await parseError(resp, 'Error al validar auditorías');
    const json = await resp.json();
    return Number(json.cantidad ?? 0);
  },

  async cargarIndicadoresPuntos(
    idIndicador: number,
    estado: number,
  ): Promise<IndicadoresPuntosResponse> {
    const resp = await fetchWithAuth(`${BASE}/indicadores-puntos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_indicador: idIndicador, estado }),
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar puntos de indicadores');
    const json = await resp.json();
    const indicadores = (json.indicadores ?? []).map(
      (i: Record<string, unknown>) => ({
        idIndicador: Number(i.id_indicador ?? i.idIndicador ?? 0),
        nombres: String(i.nombres ?? ''),
        puntuacion: Number(i.puntuacion ?? 0),
        editable: Boolean(i.editable),
      }),
    );
    return {
      indicadores,
      sumaPuntos: Number(json.sumaPuntos ?? 0),
      estadoIndCambiar: Number(json.estadoIndCambiar ?? estado),
      idIndicadorCambiar: Number(json.idIndicadorCambiar ?? idIndicador),
    };
  },

  async guardarCambioIndicadores(payload: {
    datosInd: string;
    idIndicador: number;
    estado: number;
  }) {
    const resp = await fetchWithAuth(`${BASE}/update-ind-estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        datosInd: payload.datosInd,
        idIndicador: payload.idIndicador,
        estado: payload.estado,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al guardar indicadores');
    return resp.json();
  },

  async crearIndicador(payload: {
    datosInd: string;
    newInd: string;
    newIndPuntos: number;
  }) {
    const resp = await fetchWithAuth(`${BASE}/update-ind`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) await parseError(resp, 'Error al crear indicador');
    return resp.json();
  },

  async updateIndicadorEstado(payload: { idIndicador: number; estado: number }) {
    const resp = await fetchWithAuth(`${BASE}/estado-indicador`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_indicador: payload.idIndicador,
        estado: payload.estado,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al actualizar indicador');
    const json = await resp.json();
    if (json.result === 3) {
      throw new Error('Hay auditorías pendientes; no se puede cambiar el indicador');
    }
    return json;
  },

  async listarItems(idIndicador: number): Promise<ItemConfig[]> {
    const resp = await fetchWithAuth(`${BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_indicador: idIndicador }),
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar items');
    const json = await resp.json();
    return (Array.isArray(json) ? json : json.items ?? []).map(
      (i: Record<string, unknown>) => ({
        idItem: Number(i.id_item ?? i.idItem ?? 0),
        concepto: String(i.concepto ?? ''),
        estado: Number(i.estado ?? 0),
        accionEstado: i.accionEstado != null ? String(i.accionEstado) : undefined,
        nuevoEstado:
          i.nuevoEstado != null ? Number(i.nuevoEstado) : undefined,
      }),
    );
  },

  async agregarItem(payload: { idIndicador: number; concepto: string }) {
    const resp = await fetchWithAuth(`${BASE}/add-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_indicador: payload.idIndicador,
        concepto: payload.concepto,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al agregar item');
    return resp.json();
  },

  async updateItemEstado(payload: { idItem: number; estado: number }) {
    const resp = await fetchWithAuth(`${BASE}/estado-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_item: payload.idItem,
        estado: payload.estado,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al actualizar item');
    const json = await resp.json();
    if (json.result === 3) {
      throw new Error('Hay auditorías pendientes; no se puede cambiar el item');
    }
    return json;
  },

  async listarObservaciones(idItem: number): Promise<ObservacionConfig[]> {
    const resp = await fetchWithAuth(`${BASE}/obs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_item: idItem }),
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar observaciones');
    const json = await resp.json();
    return (Array.isArray(json) ? json : json.observaciones ?? []).map(
      (o: Record<string, unknown>) => ({
        idObs: Number(o.id_obs ?? o.idObs ?? 0),
        observacion: String(o.observacion ?? ''),
        estado: Number(o.estado ?? 0),
        accionEstado: o.accionEstado != null ? String(o.accionEstado) : undefined,
        nuevoEstado:
          o.nuevoEstado != null ? Number(o.nuevoEstado) : undefined,
      }),
    );
  },

  async agregarObservacion(payload: { idItem: number; observacion: string }) {
    const resp = await fetchWithAuth(`${BASE}/add-obs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_item: payload.idItem,
        obs: payload.observacion,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al agregar observación');
    return resp.json();
  },

  async updateObservacionEstado(payload: { idObs: number; estado: number }) {
    const resp = await fetchWithAuth(`${BASE}/estado-obs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_obs: payload.idObs,
        estado: payload.estado,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al actualizar observación');
    const json = await resp.json();
    if (json.result === 3) {
      throw new Error('Hay auditorías pendientes; no se puede cambiar la observación');
    }
    return json;
  },

  async informeDetalle(payload: {
    nitAgente: number;
    mes: string;
  }): Promise<InformeDetalleResult> {
    const resp = await fetchWithAuth(`${BASE}/inf-detalle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nitAgente: payload.nitAgente,
        AuditoriaMes: payload.mes,
      }),
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar informe detalle');
    const json = await resp.json();
    const filas = (json.filas ?? json.items ?? []).map(
      (r: Record<string, unknown>) => ({
        fecha: formatDateOnly(r.fecha ?? ''),
        puntos:
          r.puntuacion != null && r.puntuacion !== ''
            ? Number(r.puntuacion)
            : r.puntos != null
              ? Number(r.puntos)
              : null,
        idAuditoria: Number(r.id_auditoria ?? r.idAuditoria ?? 0),
        puedeVer: Boolean(r.puedeVer),
        puedeEditar: Boolean(r.puedeEditar),
      }),
    );
    return {
      filas,
      promedio: json.promedio != null ? Number(json.promedio) : undefined,
      sumaPuntos: json.sumaPuntos != null ? Number(json.sumaPuntos) : undefined,
      cantidad: json.cantidad != null ? Number(json.cantidad) : undefined,
      mensaje: json.mensaje != null ? String(json.mensaje) : undefined,
    };
  },
};
