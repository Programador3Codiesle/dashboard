import { ITicket, CrearTicketDTO } from "../types";
import { MOCK_TICKETS as INITIAL_MOCK_TICKETS } from "../constants";

// Create a local mutable copy of the tickets
let tickets = [...INITIAL_MOCK_TICKETS];

function delay<T>(ms = 600, result?: T) {
  return new Promise<T>((res) => setTimeout(() => res(result as T), ms));
}

export const ticketsService = {
  async listActivos(): Promise<ITicket[]> {
    const data = tickets.filter(t => t.estado === "abierto");
    return delay(500, data);
  },
  async listFinalizados(): Promise<ITicket[]> {
    const data = tickets.filter(t => t.estado === "cerrado");
    return delay(500, data);
  },
  async listMisTickets(username: string): Promise<ITicket[]> {
    const data = tickets.filter(t => t.usuario === "juan.perez");
    return delay(500, data);
  },
  async crearTicket(dto: CrearTicketDTO & { usuario: string }): Promise<ITicket> {
    const nextId = Math.max(...tickets.map(t => t.id), 1000) + 1;
    const ticket: ITicket = {
      id: nextId,
      tipoSoporte: dto.tipoSoporte,
      anydesk: dto.anydesk || "",
      descripcion: dto.descripcion,
      archivoUrl: dto.archivo ? URL.createObjectURL(dto.archivo) : null,
      empresa: dto.empresa,
      prioridad: dto.prioridad || "media",
      usuario: dto.usuario,
      encargado: null,
      estado: "abierto",
      fechaCreacion: new Date().toISOString()
    };
    tickets = [ticket, ...tickets];
    return delay(700, ticket);
  },
  async reasignar(id: number, encargado: string) {
    tickets = tickets.map(t => t.id === id ? { ...t, encargado } : t);
    return delay(300, true);
  },
  async responder(id: number, mensaje: string, cerrar: boolean) {
    // append pseudo-response (not stored) and optionally close
    tickets = tickets.map(t => t.id === id ? { ...t, estado: cerrar ? "cerrado" : t.estado } : t);
    return delay(300, true);
  }
};
