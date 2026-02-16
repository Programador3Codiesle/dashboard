// src/modules/tickets/hooks/useTicketDetail.ts
import { useQuery } from "@tanstack/react-query";
import { ticketsService } from "../services/tickets.service";

export const TICKET_DETAIL_QUERY_KEY = ["tickets", "detail"] as const;

/**
 * Hook para cargar el detalle de un ticket con React Query
 * - Solo fetchea cuando enabled es true (modal abierto)
 * - Cache por ticketId
 */
export function useTicketDetail(ticketId: number | null, enabled: boolean) {
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: [...TICKET_DETAIL_QUERY_KEY, ticketId],
    queryFn: () => ticketsService.getTicketById(ticketId!),
    enabled: enabled && !!ticketId,
    staleTime: 30 * 1000, // 30 segundos
  });

  return {
    ticketData: data ?? null,
    loading,
    error: error ? "No se pudo cargar el ticket" : null,
  };
}
