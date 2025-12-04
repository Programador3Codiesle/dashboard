// src/app/dashboard/tickets/finalizados/page.tsx
'use client';
import { useTickets } from "@/modules/tickets/hooks/useTickets";
import TicketsTableFinalizados from "@/components/tickets/TicketsTableFinalizados";

export default function FinalizadosPage() {
    const { tickets, loading } = useTickets("finalizados");

    return (
        <div>
            <TicketsTableFinalizados tickets={tickets} loading={loading} />
        </div>
    );
}
