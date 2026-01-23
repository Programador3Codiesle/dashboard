import { ITicket, CrearTicketDTO } from "../types";
import {
  empresasDisponibles,
  mapEmpresaCodesToNames,
  mapEstadoFromApi,
  normalizePrioridad,
} from "../constants";
import { fetchWithAuth } from "@/utils/api";
import { getUser } from "@/utils/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ==== Tipos de respuesta de la API (raw) ====

type TicketActivoApi = {
  id: number;
  tipo_soporte: string;
  empresa: string | null;
  prioridad: string | null;
  estado: string;
  fecha_creacion: string;
  usuario_id: number;
  nombre_usuario: string;
  nombre_encargado: string | null;
};

type TicketFinalizadoApi = {
  id: number;
  tipo_soporte: string;
  prioridad: string | null;
  estado: string;
  fecha_creacion: string;
  usuario_id: number;
  nombre_usuario: string;
  nombre_encargado: string | null;
};

type TicketMisTicketsApi = {
  id: number;
  tipo_soporte: string;
  prioridad: string | null;
  estado: string;
  fecha_creacion: string;
  usuario_id: number;
  nombre_usuario: string;
  nombre_encargado: string | null;
};

type ApiMessageResponse<T = unknown> = {
  status: boolean;
  message: string;
  data?: T;
};

// ==== Mapeadores ====

function mapActivoFromApi(raw: TicketActivoApi): ITicket {

  return {
    id: raw.id,
    tipoSoporte: raw.tipo_soporte,
    anydesk: "", // la API actual no envía anydesk en listados
    descripcion: "", // sólo viene en detalle/creación, no en los listados
    archivoUrl: null,
    empresa: mapEmpresaCodesToNames(raw.empresa),
    prioridad: normalizePrioridad(raw.prioridad),
    usuario: raw.nombre_usuario,
    encargado: raw.nombre_encargado,
    estado: mapEstadoFromApi(raw.estado),
    fechaCreacion: raw.fecha_creacion,
  };
}

function mapFinalizadoFromApi(raw: TicketFinalizadoApi): ITicket {
  return {
    id: raw.id,
    tipoSoporte: raw.tipo_soporte,
    anydesk: "",
    descripcion: "",
    archivoUrl: null,
    empresa: "N/A",
    prioridad: normalizePrioridad(raw.prioridad),
    usuario: raw.nombre_usuario,
    encargado: raw.nombre_encargado,
    estado: mapEstadoFromApi(raw.estado),
    fechaCreacion: raw.fecha_creacion,
  };
}

function mapMisTicketsFromApi(raw: TicketMisTicketsApi): ITicket {
  return {
    id: raw.id,
    tipoSoporte: raw.tipo_soporte,
    anydesk: "",
    descripcion: "",
    archivoUrl: null,
    empresa: "N/A",
    prioridad: normalizePrioridad(raw.prioridad),
    usuario: raw.nombre_usuario,
    encargado: raw.nombre_encargado,
    estado: mapEstadoFromApi(raw.estado),
    fechaCreacion: raw.fecha_creacion,
  };
}

// ==== Servicio contra API real ====

export const ticketsService = {
  async listActivos(): Promise<ITicket[]> {
    const resp = await fetchWithAuth(`${API_URL}/tickets/activos`, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error("No se pudieron cargar los tickets activos");
    }

    const data: TicketActivoApi[] = await resp.json();
    return data.map(mapActivoFromApi);
  },

  async listFinalizados(): Promise<ITicket[]> {
    const resp = await fetchWithAuth(`${API_URL}/tickets/finalizados`, {
      method: "GET",
    });

    if (!resp.ok) {
      throw new Error("No se pudieron cargar los tickets finalizados");
    }

    const data: TicketFinalizadoApi[] = await resp.json();
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

    const data: TicketMisTicketsApi[] = await resp.json();
    return data.map(mapMisTicketsFromApi);
  },

  // En esta versión asumimos que el archivo ya fue subido y tenemos una URL.
  // El flujo de subida real se implementará en una ruta de API de Next.
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

    const data: ApiMessageResponse<TicketActivoApi & { anydesk?: string; archivo_url?: string | null; descripcion?: string }> =
      await resp.json();

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

  async getTicketById(id: number): Promise<{
    id: number;
    tipoSoporte: string;
    descripcion: string;
    prioridad: string;
    estado: string;
    fechaCreacion: string;
    usuarioId: number;
    anydesk: string;
    archivoUrl: string | null;
    respuestas: string;
  }> {
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
      anydesk: data.anydesk || "",
      archivoUrl: data.archivo_url || null,
      respuestas: data.respuestas || "",
    };
  },
};
