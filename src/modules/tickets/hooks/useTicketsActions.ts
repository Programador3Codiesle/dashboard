// src/modules/tickets/hooks/useTicketsActions.ts
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketsService } from "../services/tickets.service";
import { CrearTicketDTO } from "../types";
import { useToast } from "@/components/shared/ui/ToastContext";

/**
 * Hook de acciones de tickets con React Query Mutations
 * - Invalidación automática de caché después de cada mutación exitosa
 * - Manejo de errores centralizado
 * - Toast de feedback al usuario
 */
export function useTicketsActions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const invalidateTickets = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
  }, [queryClient]);

  const crearTicketMutation = useMutation({
    mutationFn: (dto: CrearTicketDTO & { archivoUrl?: string | null }) =>
      ticketsService.crearTicket(dto),
    onSuccess: () => {
      showSuccess("Ticket creado correctamente");
      invalidateTickets();
    },
    onError: (err: Error) => {
      showError(err.message || "No se pudo crear el ticket");
    },
  });

  const reasignarMutation = useMutation({
    mutationFn: ({ id, encargadoId, prioridad }: { id: number; encargadoId: string; prioridad: string }) =>
      ticketsService.reasignar(id, encargadoId, prioridad),
    onSuccess: () => {
      showSuccess("Ticket actualizado correctamente");
      invalidateTickets();
    },
    onError: (err: Error) => {
      showError(err.message || "No se pudo actualizar el ticket");
    },
  });

  const responderMutation = useMutation({
    mutationFn: ({
      id,
      mensaje,
      cerrar,
      nombre,
    }: {
      id: number;
      mensaje: string;
      cerrar: boolean;
      nombre: string;
    }) => {
      const estado = cerrar ? "Cerrado" : "";
      return ticketsService.responder(id, mensaje, estado, nombre);
    },
    onSuccess: () => {
      showSuccess("Respuesta exitosa");
      invalidateTickets();
    },
    onError: (err: Error) => {
      showError(err.message || "No se pudo enviar la respuesta");
    },
  });

  const crearTicket = useCallback(
    async (dto: CrearTicketDTO & { archivoUrl?: string | null }) => {
      try {
        return await crearTicketMutation.mutateAsync(dto);
      } catch {
        throw new Error("No se pudo crear el ticket");
      }
    },
    [crearTicketMutation]
  );

  const reasignar = useCallback(
    async (id: number, encargadoId: string, prioridad: string) => {
      try {
        await reasignarMutation.mutateAsync({ id, encargadoId, prioridad });
        return true;
      } catch {
        throw new Error("No se pudo reasignar el ticket");
      }
    },
    [reasignarMutation]
  );

  const responder = useCallback(
    async (id: number, mensaje: string, cerrar: boolean, nombre: string) => {
      try {
        await responderMutation.mutateAsync({ id, mensaje, cerrar, nombre });
        return true;
      } catch {
        throw new Error("No se pudo enviar la respuesta");
      }
    },
    [responderMutation]
  );

  return { crearTicket, reasignar, responder };
}
