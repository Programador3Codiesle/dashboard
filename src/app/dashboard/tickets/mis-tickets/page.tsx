// src/app/dashboard/tickets/mis-tickets/page.tsx
'use client';
import { useAuth } from "@/core/auth/hooks/useAuth";
import TicketsTableMisTickets from "@/components/tickets/TicketsTableMisTickets";
import { useTickets } from "@/modules/tickets/hooks/useTickets";

export default function MisTicketsPage() {
    const { user } = useAuth();
  const { tickets, loading } = useTickets("mis");

    return (
        <div>
            <TicketsTableMisTickets tickets={tickets} loading={loading} />
        </div>
    );
}
