// src/app/dashboard/tickets/activos/page.tsx
'use client';
import { useTickets } from "@/modules/tickets/hooks/useTickets";
import TicketsCardsActivos from "@/components/tickets/TicketsCardsActivos";
import { useAuth } from "@/core/auth/hooks/useAuth";

export default function ActivosPage() {
    const { user } = useAuth();
    const { tickets, loading } = useTickets("activos");

    if (user?.role !== "admin") return <div className="p-6">No autorizado</div>;

    return (
        <div>
            <TicketsCardsActivos tickets={tickets} loading={loading} />
        </div>
    );
}
