// src/modules/tickets/hooks/useTickets.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ITicket } from "../types";
import { ticketsService } from "../services/tickets.service";

type TicketsKind = "activos" | "finalizados" | "mis";

// Query keys para diferentes tipos de tickets
export const TICKETS_QUERY_KEYS = {
  activos: ["tickets", "activos"] as const,
  finalizados: ["tickets", "finalizados"] as const,
  mis: ["tickets", "mis"] as const,
};

/**
 * Hook optimizado con React Query para gestión de tickets
 * - Caché automática diferenciada por tipo de ticket
 * - Retry automático en caso de error
 * - Invalidación vía useMutation en useTicketsActions
 */
export function useTickets(kind: TicketsKind, page: number = 1, limit: number = 100) {
  const queryClient = useQueryClient();
  const queryKey =
    kind === "mis"
      ? TICKETS_QUERY_KEYS[kind]
      : [...TICKETS_QUERY_KEYS[kind], page, limit];

  const fetchFn = async (): Promise<ITicket[]> => {
    switch (kind) {
      case "activos":
        return ticketsService.listActivos(page, limit);
      case "finalizados":
        return ticketsService.listFinalizados(page, limit);
      case "mis":
        return ticketsService.listMisTickets();
      default:
        return [];
    }
  };

  const {
    data: tickets = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchFn,
    staleTime: 2 * 60 * 1000, // 2 minutos para tickets (datos más dinámicos)
  });

  // Función para actualizar el cache manualmente (para optimistic updates)
  const setTickets = (newTickets: ITicket[] | ((prev: ITicket[]) => ITicket[])) => {
    queryClient.setQueryData(queryKey, (old: ITicket[] | undefined) => {
      if (typeof newTickets === 'function') {
        return newTickets(old || []);
      }
      return newTickets;
    });
  };

  const error = queryError ? "No se pudieron cargar los tickets" : null;

  return { tickets, loading, error, setTickets, refetch };
}
