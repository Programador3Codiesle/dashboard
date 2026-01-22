// src/modules/tickets/hooks/useTickets.ts
import { useCallback, useEffect, useState, useRef } from "react";
import { ITicket } from "../types";
import { ticketsService } from "../services/tickets.service";

type TicketsKind = "activos" | "finalizados" | "mis";

export function useTickets(kind: TicketsKind) {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTickets = useCallback(async () => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController para esta petición
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      let data: ITicket[] = [];

      if (kind === "activos") data = await ticketsService.listActivos();
      if (kind === "finalizados") data = await ticketsService.listFinalizados();
      if (kind === "mis") data = await ticketsService.listMisTickets();

      // Solo actualizar estado si el componente sigue montado y no se canceló la petición
      if (mountedRef.current && !abortController.signal.aborted) {
        setTickets(data);
      }
    } catch (err: any) {
      // Ignorar errores de cancelación
      if (err.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      console.error(err);
      if (mountedRef.current && !abortController.signal.aborted) {
        setError("No se pudieron cargar los tickets");
      }
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [kind]);

  useEffect(() => {
    mountedRef.current = true;
    fetchTickets();

    // Cleanup: marcar como desmontado y cancelar petición pendiente
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTickets]);

  // Permite que otras partes del front pidan refrescar los datos
  useEffect(() => {
    const handler = () => {
      if (mountedRef.current) {
        fetchTickets();
      }
    };

    window.addEventListener("tickets:updated", handler);

    return () => {
      window.removeEventListener("tickets:updated", handler);
    };
  }, [fetchTickets]);

  const refetch = useCallback(() => {
    if (mountedRef.current) {
      fetchTickets();
    }
  }, [fetchTickets]);

  return { tickets, loading, error, setTickets, refetch };
}
