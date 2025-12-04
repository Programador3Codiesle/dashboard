'use client';
import React from "react";
import { COMPANY_STYLES } from "../../modules/tickets/constants";

export function TicketBadgeEmpresa({ empresa }: { empresa: string }) {
    const cls = COMPANY_STYLES[empresa] || COMPANY_STYLES.default;
    return (
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ring-1 ring-inset ${cls}`}>
            {empresa}
        </span>
    );
}
