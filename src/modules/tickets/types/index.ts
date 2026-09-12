// src/modules/tickets/types/index.ts
export type Prioridad = "alta" | "media" | "baja";
export type EstadoTicket = "abierto" | "cerrado" | "mio" | "en proceso" | "activo";

export interface ITicket {
  id: number;
  tipoSoporte: string;
  anydesk?: string;
  descripcion: string;
  archivoUrl?: string | null;
  empresa: string;
  prioridad: Prioridad;
  usuario: string;
  encargado: string | null;
  estado: EstadoTicket;
  fechaCreacion: string; // ISO
  sede?: string;
  extension?: string;
}

export interface ITicketDetalle {
  id: number;
  tipoSoporte: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  fechaCreacion: string;
  usuarioId: number;
  usuario: string;
  encargado: string | null;
  anydesk: string;
  archivoUrl: string | null;
  respuestas: string;
  sede?: string;
  extension?: string;
}

export interface CrearTicketDTO {
  tipoSoporte: string;
  anydesk?: string;
  descripcion: string;
  sede: string;
  extension?: string;
}
