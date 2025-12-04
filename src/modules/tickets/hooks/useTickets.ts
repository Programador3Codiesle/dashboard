// src/modules/tickets/hooks/useTickets.ts
import { useEffect, useState } from "react";
import { ITicket } from "../types";
import { ticketsService } from "../services/tickets.service";

export function useTickets(kind: "activos" | "finalizados", username?: string) {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        if (kind === "activos") setTickets(await ticketsService.listActivos());
        if (kind === "finalizados") setTickets(await ticketsService.listFinalizados());
      } catch (err) {
        console.error(err);
        if (mounted) setError("No se pudieron cargar los tickets");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [kind, username]);

  return { tickets, loading, error, setTickets };
}
