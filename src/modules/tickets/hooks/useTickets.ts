// src/modules/tickets/hooks/useTickets.ts
import { useCallback, useEffect, useState } from "react";
import { ITicket } from "../types";
import { ticketsService } from "../services/tickets.service";

type TicketsKind = "activos" | "finalizados" | "mis";

export function useTickets(kind: TicketsKind) {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    let mounted = true;
    setLoading(true);
    setError(null);

    try {
      let data: ITicket[] = [];

      if (kind === "activos") data = await ticketsService.listActivos();
      if (kind === "finalizados") data = await ticketsService.listFinalizados();
      if (kind === "mis") data = await ticketsService.listMisTickets();

      if (mounted) setTickets(data);
    } catch (err) {
      console.error(err);
      if (mounted) setError("No se pudieron cargar los tickets");
    } finally {
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [kind]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Permite que otras partes del front pidan refrescar los datos
  useEffect(() => {
    const handler = () => {
      fetchTickets();
    };

    window.addEventListener("tickets:updated", handler);

    return () => {
      window.removeEventListener("tickets:updated", handler);
    };
  }, [fetchTickets]);

  const refetch = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, setTickets, refetch };
}
