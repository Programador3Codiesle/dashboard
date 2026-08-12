import { fetchWithAuth } from '@/utils/api';
import { getApiBaseUrl } from '@/config/public-env';

const BASE = `${getApiBaseUrl()}/mantenimiento`;

async function parseError(resp: Response, fallback: string): Promise<never> {
  const json = await resp.json().catch(() => ({}));
  const message = (json as { message?: string | string[] }).message;
  const text = Array.isArray(message) ? message.join(', ') : message;
  throw new Error(text || fallback);
}

export const mantenimientoService = {
  async catalogos() {
    const resp = await fetchWithAuth(`${BASE}/catalogos`);
    if (!resp.ok) await parseError(resp, 'Error al cargar catálogos');
    return resp.json() as Promise<{
      familias: Array<{ codigo: string; nombre: string }>;
      jefes: Array<{ nit: string; nombres: string; correo: string | null }>;
      personal: Array<{ nit: string; nombres: string; id_usuario: number }>;
      bodegas: Array<{ bodega: number; descripcion: string }>;
      equipos: Array<{ id_equipo: number; codigo: string; nombre_equipo: string }>;
    }>;
  },

  async listarEquipos(params: {
    page: number;
    limit: number;
    filter?: string;
    bodega?: string;
    area?: string;
  }) {
    const q = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    });
    if (params.filter) q.set('filter', params.filter);
    if (params.bodega) q.set('bodega', params.bodega);
    if (params.area) q.set('area', params.area);
    const resp = await fetchWithAuth(`${BASE}/equipos?${q}`);
    if (!resp.ok) await parseError(resp, 'Error al listar equipos');
    return resp.json() as Promise<{
      data: Array<Record<string, unknown>>;
      total: number;
      page: number;
      limit: number;
    }>;
  },

  async nombresFamilia(codigo: string) {
    const resp = await fetchWithAuth(`${BASE}/equipos/nombres-familia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo }),
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar nombres');
    return resp.json() as Promise<
      Array<{ codigo_equipo: string; nombre_equipo: string }>
    >;
  },

  async crearEquipo(form: FormData) {
    const resp = await fetchWithAuth(`${BASE}/equipos`, {
      method: 'POST',
      body: form,
    });
    if (!resp.ok) await parseError(resp, 'Error al crear equipo');
    return resp.json();
  },

  async getHojaVida(id: number) {
    const resp = await fetchWithAuth(`${BASE}/equipos/${id}/hoja-vida`);
    if (!resp.ok) await parseError(resp, 'Error al cargar hoja de vida');
    return resp.json() as Promise<{
      equipo: Record<string, unknown>;
      tecnicos: Record<string, string | null> | null;
      hidraulicos: Record<string, string | null> | null;
      elementos: Array<{ orden: number; texto: string }>;
      recomendaciones: Array<{ orden: number; texto: string }>;
      mtto_operativo: Array<{ orden: number; texto: string }>;
      historial: {
        preventivo: Array<Record<string, unknown>>;
        correctivo: Array<Record<string, unknown>>;
      };
    }>;
  },

  async updateHojaVida(id: number, form: FormData) {
    const resp = await fetchWithAuth(`${BASE}/equipos/${id}/hoja-vida`, {
      method: 'PUT',
      body: form,
    });
    if (!resp.ok) await parseError(resp, 'Error al actualizar hoja de vida');
    return resp.json();
  },

  async getEquipo(id: number) {
    const resp = await fetchWithAuth(`${BASE}/equipos/${id}`);
    if (!resp.ok) await parseError(resp, 'Error al obtener equipo');
    return resp.json();
  },

  async actualizarEquipo(id: number, form: FormData) {
    const resp = await fetchWithAuth(`${BASE}/equipos/${id}`, {
      method: 'PUT',
      body: form,
    });
    if (!resp.ok) await parseError(resp, 'Error al actualizar');
    return resp.json();
  },

  async historial(id: number) {
    const resp = await fetchWithAuth(`${BASE}/equipos/${id}/historial`);
    if (!resp.ok) await parseError(resp, 'Error al cargar historial');
    return resp.json() as Promise<{
      preventivo: Array<Record<string, unknown>>;
      correctivo: Array<Record<string, unknown>>;
    }>;
  },

  async ordenPreventivo(id: number, body: Record<string, string | number>) {
    const resp = await fetchWithAuth(`${BASE}/equipos/${id}/orden-preventivo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) await parseError(resp, 'Error al crear OT');
    return resp.json();
  },

  async retiro(id: number, form: FormData) {
    const resp = await fetchWithAuth(`${BASE}/equipos/${id}/retiro`, {
      method: 'POST',
      body: form,
    });
    if (!resp.ok) await parseError(resp, 'Error al solicitar retiro');
    return resp.json();
  },

  async listarCorrectivo() {
    const resp = await fetchWithAuth(`${BASE}/correctivo/solicitudes`);
    if (!resp.ok) await parseError(resp, 'Error al listar solicitudes');
    return resp.json() as Promise<Array<Record<string, unknown>>>;
  },

  async getSolicitud(id: number) {
    const resp = await fetchWithAuth(`${BASE}/correctivo/solicitudes/${id}`);
    if (!resp.ok) await parseError(resp, 'Error al obtener solicitud');
    return resp.json();
  },

  async crearSolicitud(form: FormData) {
    const resp = await fetchWithAuth(`${BASE}/correctivo/solicitudes`, {
      method: 'POST',
      body: form,
    });
    if (!resp.ok) await parseError(resp, 'Error al crear solicitud');
    return resp.json();
  },

  async iniciarSolicitud(id: number, tiempo_estimado: number) {
    const resp = await fetchWithAuth(
      `${BASE}/correctivo/solicitudes/${id}/iniciar`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiempo_estimado }),
      },
    );
    if (!resp.ok) await parseError(resp, 'Error al iniciar');
    return resp.json();
  },

  async finalizarSolicitud(id: number, form: FormData) {
    const resp = await fetchWithAuth(
      `${BASE}/correctivo/solicitudes/${id}/finalizar`,
      { method: 'POST', body: form },
    );
    if (!resp.ok) await parseError(resp, 'Error al finalizar');
    return resp.json();
  },

  async mensajes(id: number) {
    const resp = await fetchWithAuth(
      `${BASE}/correctivo/solicitudes/${id}/mensajes`,
    );
    if (!resp.ok) await parseError(resp, 'Error al cargar mensajes');
    return resp.json() as Promise<Array<Record<string, unknown>>>;
  },

  async enviarMensaje(id: number, mensaje: string) {
    const resp = await fetchWithAuth(
      `${BASE}/correctivo/solicitudes/${id}/mensajes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje }),
      },
    );
    if (!resp.ok) await parseError(resp, 'Error al enviar mensaje');
    return resp.json();
  },

  async eventosPreventivo() {
    const resp = await fetchWithAuth(`${BASE}/preventivo/eventos`);
    if (!resp.ok) await parseError(resp, 'Error al cargar cronograma');
    return resp.json() as Promise<
      Array<{
        id: number;
        title: string;
        start: string;
        end?: string;
        color: string;
        descripcion: string;
      }>
    >;
  },

  async listadoPreventivo() {
    const resp = await fetchWithAuth(`${BASE}/preventivo/listado`);
    if (!resp.ok) await parseError(resp, 'Error al cargar listado');
    return resp.json() as Promise<Array<Record<string, unknown>>>;
  },

  async getOrdenPreventivo(id: number) {
    const resp = await fetchWithAuth(`${BASE}/preventivo/ordenes/${id}`);
    if (!resp.ok) await parseError(resp, 'Error al obtener orden');
    return resp.json();
  },

  async iniciarOrden(id: number, asignado: string) {
    const resp = await fetchWithAuth(`${BASE}/preventivo/ordenes/${id}/iniciar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asignado }),
    });
    if (!resp.ok) await parseError(resp, 'Error al iniciar orden');
    return resp.json();
  },

  async finalizarOrden(
    id: number,
    observaciones: string,
    piezas: string,
    opts?: { reasignar?: boolean; periodo?: string },
  ) {
    const resp = await fetchWithAuth(
      `${BASE}/preventivo/ordenes/${id}/finalizar`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observaciones,
          piezas,
          reasignar: Boolean(opts?.reasignar),
          ...(opts?.periodo ? { periodo: opts.periodo } : {}),
        }),
      },
    );
    if (!resp.ok) await parseError(resp, 'Error al finalizar orden');
    return resp.json();
  },

  async eliminarOrden(id: number) {
    const resp = await fetchWithAuth(`${BASE}/preventivo/ordenes/${id}`, {
      method: 'DELETE',
    });
    if (!resp.ok) await parseError(resp, 'Error al eliminar');
    return resp.json();
  },

  async updateFechaOrden(id: number, date: string, date_old: string) {
    const resp = await fetchWithAuth(`${BASE}/preventivo/ordenes/${id}/fecha`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, date_old }),
    });
    if (!resp.ok) await parseError(resp, 'Error al actualizar fecha');
    return resp.json();
  },

  async uploadCronograma(file: File) {
    const form = new FormData();
    form.append('excel', file);
    const resp = await fetchWithAuth(`${BASE}/preventivo/upload`, {
      method: 'POST',
      body: form,
    });
    if (!resp.ok) await parseError(resp, 'Error al cargar Excel');
    return resp.json() as Promise<{ ok: number; err_db: number }>;
  },

  plantillaUrl() {
    return `${BASE}/preventivo/plantilla`;
  },

  async informePreventivo(estado?: string, bodega?: string) {
    const q = new URLSearchParams();
    if (estado) q.set('estado', estado);
    if (bodega) q.set('bodega', bodega);
    const resp = await fetchWithAuth(`${BASE}/informes/preventivo?${q}`);
    if (!resp.ok) await parseError(resp, 'Error informe preventivo');
    return resp.json() as Promise<Array<Record<string, unknown>>>;
  },

  async informeCorrectivo(estado?: string, bodega?: string) {
    const q = new URLSearchParams();
    if (estado) q.set('estado', estado);
    if (bodega) q.set('bodega', bodega);
    const resp = await fetchWithAuth(`${BASE}/informes/correctivo?${q}`);
    if (!resp.ok) await parseError(resp, 'Error informe correctivo');
    return resp.json() as Promise<Array<Record<string, unknown>>>;
  },
};
