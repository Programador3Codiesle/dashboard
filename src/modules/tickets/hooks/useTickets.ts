// src/modules/tickets/hooks/useTickets.ts
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ITicket } from "../types";
import { ticketsService } from "../services/tickets.service";

type TicketsKind = "activos" | "finalizados" | "mis";

// Query keys para diferentes tipos de tickets
export const TICKETS_QUERY_KEYS = {
  activos: ['tickets', 'activos'] as const,
  finalizados: ['tickets', 'finalizados'] as const,
  mis: ['tickets', 'mis'] as const,
};

/**
 * Hook optimizado con React Query para gestión de tickets
 * - Caché automática diferenciada por tipo de ticket
 * - Retry automático en caso de error
 * - Sincronización entre componentes
 * - Invalidación automática con evento 'tickets:updated'
 */
export function useTickets(kind: TicketsKind) {
  const queryClient = useQueryClient();
  const queryKey = TICKETS_QUERY_KEYS[kind];

  const fetchFn = async (): Promise<ITicket[]> => {
    switch (kind) {
      case "activos":
        return ticketsService.listActivos();
      case "finalizados":
        return ticketsService.listFinalizados();
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
    refetch 
  } = useQuery({
    queryKey,
    queryFn: fetchFn,
    staleTime: 2 * 60 * 1000, // 2 minutos para tickets (datos más dinámicos)
  });

  // Escuchar evento global para invalidar caché
  useEffect(() => {
    const handler = () => {
      // Invalidar todas las queries de tickets
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    };

    window.addEventListener("tickets:updated", handler);
    return () => window.removeEventListener("tickets:updated", handler);
  }, [queryClient]);

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
