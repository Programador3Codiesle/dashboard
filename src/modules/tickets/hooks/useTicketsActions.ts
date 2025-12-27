// src/modules/tickets/hooks/useTicketsActions.ts
import { ticketsService } from "../services/tickets.service";
import { CrearTicketDTO } from "../types";
import { useToast } from "@/components/shared/ui/ToastContext";

export function useTicketsActions() {
  const { showSuccess, showError } = useToast();

  const crearTicket = async (dto: CrearTicketDTO & { archivoUrl?: string | null }) => {
    try {
      const ticket = await ticketsService.crearTicket(dto);
      showSuccess("Ticket creado correctamente");
      // Notificar al resto del front para que recargue listas
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("tickets:updated"));
      }
      return ticket;
    } catch (err: any) {
      console.error(err);
      showError(err.message || "No se pudo crear el ticket");
      throw err;
    }
  };

  const reasignar = async (id: number, encargadoId: string, prioridad: string) => {
    try {
      await ticketsService.reasignar(id, encargadoId, prioridad);
      showSuccess("Ticket actualizado correctamente");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("tickets:updated"));
      }
      return true;
    } catch (err: any) {
      console.error(err);
      showError(err.message || "No se pudo actualizar el ticket");
      throw err;
    }
  };

  const responder = async (id: number, mensaje: string, cerrar: boolean, nombre: string) => {
    try {
      const estado = cerrar ? "Cerrado" : "";
      await ticketsService.responder(id, mensaje, estado, nombre);
      showSuccess("Respuesta exitosa");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("tickets:updated"));
      }
      return true;
    } catch (err: any) {
      console.error(err);
      showError(err.message || "No se pudo enviar la respuesta");
      throw err;
    }
  };

  return { crearTicket, reasignar, responder };
}
