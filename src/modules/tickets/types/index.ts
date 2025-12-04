// src/modules/tickets/types/index.ts
export type Prioridad = "alta" | "media" | "baja";
export type EstadoTicket = "abierto" | "cerrado" | "mio";

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
}

export interface CrearTicketDTO {
  tipoSoporte: string;
  anydesk?: string;
  descripcion: string;
  empresa: string;
  archivo?: File | null;
  prioridad?: Prioridad;
}
