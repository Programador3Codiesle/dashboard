import { ITicket, ITicketDetalle, CrearTicketDTO } from "../types";
import {
  mapEmpresaCodesToNames,
  mapEstadoFromApi,
  normalizePrioridad,
} from "../mappers";
import { fetchWithAuth } from "@/utils/api";
import { getUser } from "@/utils/cookies";
import { getApiBaseUrl } from "@/config/public-env";

const API_URL = getApiBaseUrl();

type TicketListadoApi = {
  id: number;
  tipo_soporte: string;
  empresa?: string | null;
  prioridad: string | null;
  estado: string;
  fecha_creacion: string;
  usuario_id: number;
  nombre_usuario: string;
  nombre_encargado: string | null;
  sede?: string | null;
  extension?: string | null;
};

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

function mapListadoFromApi(raw: TicketListadoApi, empresa: string): ITicket {
  return {
    id: raw.id,
    tipoSoporte: raw.tipo_soporte,
    anydesk: "",
    descripcion: "",
    archivoUrl: null,
    empresa,
    prioridad: normalizePrioridad(raw.prioridad),
    usuario: raw.nombre_usuario,
    encargado: raw.nombre_encargado,
    estado: mapEstadoFromApi(raw.estado),
    fechaCreacion: raw.fecha_creacion,
    sede: raw.sede || "",
    extension: raw.extension || "",
  };
}

function mapActivoFromApi(raw: TicketListadoApi): ITicket {
  return mapListadoFromApi(raw, mapEmpresaCodesToNames(raw.empresa));
}

function mapFinalizadoFromApi(raw: TicketListadoApi): ITicket {
  return mapListadoFromApi(raw, "N/A");
}

function mapMisTicketsFromApi(raw: TicketListadoApi): ITicket {
  return mapListadoFromApi(raw, "N/A");
}

// ==== Servicio contra API real ====

export const ticketsService = {
  async listActivos(page: number = 1, limit: number = 100): Promise<ITicket[]> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const resp = await fetchWithAuth(`${API_URL}/tickets/activos?${params}`, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error("No se pudieron cargar los tickets activos");
    }

    const data: TicketListadoApi[] = await resp.json();
    return data.map(mapActivoFromApi);
  },

  async listFinalizados(page: number = 1, limit: number = 100): Promise<ITicket[]> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    const resp = await fetchWithAuth(`${API_URL}/tickets/finalizados?${params}`, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error("No se pudieron cargar los tickets finalizados");
    }

    const data: TicketListadoApi[] = await resp.json();
    return data.map(mapFinalizadoFromApi);
  },

  async listMisTickets(): Promise<ITicket[]> {
    const user = getUser();

    if (!user || !user.user) {
      throw new Error("Usuario no autenticado");
    }
    const cedula = user.user; // El NIT del usuario

    const resp = await fetchWithAuth(`${API_URL}/tickets/mis-tickets/${cedula}`, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error("No se pudieron cargar tus tickets");
    }

    const data: TicketListadoApi[] = await resp.json();
    return data.map(mapMisTicketsFromApi);
  },

  // El archivo se sube al API (Nest); el proxy /api no enruta al route de Next.
  async uploadTicketFile(formData: FormData): Promise<{
    status: boolean;
    message?: string;
    url?: string;
  }> {
    const resp = await fetchWithAuth(`${API_URL}/tickets/upload`, {
      method: "POST",
      body: formData,
    });

    const json = (await resp.json()) as {
      status?: boolean;
      message?: string;
      url?: string;
    };

    if (!resp.ok) {
      throw new Error(
        json.message || `No se pudo subir el archivo (${resp.status})`,
      );
    }

    return {
      status: !!json.status,
      message: json.message,
      url: json.url,
    };
  },

  async crearTicket(dto: CrearTicketDTO & { archivoUrl?: string | null; empresa?: number[]; prioridad?: string }): Promise<ITicket> {
    const user = getUser();
    if (!user || !user.user) {
      throw new Error("Usuario no autenticado");
    }
    
    const body = {
      tipo_soporte: dto.tipoSoporte,
      anydesk: dto.anydesk || "",
      usuario_id: user.user, // NIT del usuario autenticado
      descripcion: dto.descripcion,
      sede: dto.sede,
      extension: dto.extension || "",
      estado: "activo",
      archivo_url: dto.archivoUrl || null,
      empresa: dto.empresa || [], // Array de números, por defecto vacío
      prioridad: dto.prioridad || "media", // String requerido, por defecto "media"
    };

    const resp = await fetchWithAuth(`${API_URL}/tickets`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error("No se pudo crear el ticket");
    }

    const data: ApiMessageResponse<
      TicketListadoApi & {
        anydesk?: string;
        archivo_url?: string | null;
        descripcion?: string;
      }
    > = await resp.json();

    if (!data.status || !data.data) {
      throw new Error(data.message || "No se pudo crear el ticket");
    }

    const raw = data.data;

    return {
      id: raw.id,
      tipoSoporte: raw.tipo_soporte,
      anydesk: raw.anydesk || "",
      descripcion: raw.descripcion || "",
      archivoUrl: raw.archivo_url || null,
      empresa: "N/A",
      prioridad: normalizePrioridad(raw.prioridad ?? ""),
      usuario: raw.nombre_usuario ?? "",
      encargado: raw.nombre_encargado ?? null,
      estado: mapEstadoFromApi(raw.estado),
      fechaCreacion: raw.fecha_creacion,
      sede: raw.sede || dto.sede,
      extension: raw.extension || dto.extension || "",
    };
  },

  async reasignar(id: number, encargadoId: string, prioridad: string) {
    const body = {
      encargado_id: parseInt(encargadoId, 10), // Parsear a número
      prioridad,
    };

    const resp = await fetchWithAuth(`${API_URL}/tickets/${id}/reasignar`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error("No se pudo reasignar el ticket");
    }

    const data: ApiMessageResponse = await resp.json();

    if (!data.status) {
      throw new Error(data.message || "No se pudo reasignar el ticket");
    }

    return true;
  },

  async responder(id: number, respuesta: string, estado: string, nombre: string) {
    const body = {
      respuesta,
      estado,
      nombre,
    };

    const resp = await fetchWithAuth(`${API_URL}/tickets/${id}/responder`, {
      method: "PUT",
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error("No se pudo enviar la respuesta");
    }

    const data: ApiMessageResponse = await resp.json();

    if (!data.status) {
      throw new Error(data.message || "No se pudo enviar la respuesta");
    }

    return true;
  },

  async getTicketById(id: number): Promise<ITicketDetalle> {
    const resp = await fetchWithAuth(`${API_URL}/tickets/${id}`, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error("No se pudo cargar el ticket");
    }

    const data = await resp.json();

    return {
      id: data.id,
      tipoSoporte: data.tipo_soporte,
      descripcion: data.descripcion,
      prioridad: data.prioridad || "",
      estado: data.estado,
      fechaCreacion: data.fecha_creacion,
      usuarioId: data.usuario_id,
      usuario: data.nombre_usuario || "",
      encargado: data.nombre_encargado || null,
      anydesk: data.anydesk || "",
      archivoUrl: data.archivo_url || null,
      respuestas: data.respuestas || "",
      sede: data.sede || "",
      extension: data.extension || "",
    };
  },
};
