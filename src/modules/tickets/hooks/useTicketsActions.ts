// src/modules/tickets/hooks/useTicketsActions.ts
import { ticketsService } from "../services/tickets.service";
import { CrearTicketDTO } from "../types";

export function useTicketsActions() {
  const crearTicket = async (dto: CrearTicketDTO & { usuario: string }) => {
    return ticketsService.crearTicket(dto);
  };

  const reasignar = async (id: number, encargado: string) => {
    return ticketsService.reasignar(id, encargado);
  };

  const responder = async (id: number, mensaje: string, cerrar: boolean) => {
    return ticketsService.responder(id, mensaje, cerrar);
  };

  return { crearTicket, reasignar, responder };
}
