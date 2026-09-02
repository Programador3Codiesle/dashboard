import { ITicket } from "../types";

export function toResponderTicketPayload(ticket: ITicket) {
  return {
    id: ticket.id,
    usuario: ticket.usuario,
    anydesk: ticket.anydesk,
    tipoSoporte: ticket.tipoSoporte,
    descripcion: ticket.descripcion,
    archivoUrl: ticket.archivoUrl ?? null,
    sede: ticket.sede,
    extension: ticket.extension,
  };
}
