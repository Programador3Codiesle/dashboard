'use client';
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/core/auth/hooks/useAuth";
import NuevoTicketModal from "@/components/tickets/modals/NuevoTicketModal";
import { Plus } from "lucide-react";

export default function TicketsLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [openNew, setOpenNew] = useState(false);

    // Mostrar todas las pestañas solo si el perfil es 1 o 20
    const canSeeAllTickets = user?.perfil_postventa === "1" || user?.perfil_postventa === "20";

    const tabs = [
        { name: "Activos", href: "/dashboard/tickets/activos", show: canSeeAllTickets },
        { name: "Finalizados", href: "/dashboard/tickets/finalizados", show: canSeeAllTickets },
        { name: "Mis Tickets", href: "/dashboard/tickets/mis-tickets", show: true },
    ];

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-amber-500 tracking-tight">Tickets de Soporte</h1>
                    <p className="text-gray-500 mt-1">Gestiona y da seguimiento a tus solicitudes de soporte.</p>
                </div>
                <button
                    onClick={() => setOpenNew(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    <span>Nuevo Ticket</span>
                </button>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.filter(t => t.show).map((tab) => {
                        const isActive = pathname.startsWith(tab.href);
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${isActive
                                        ? "border-amber-500 text-amber-500"
                                        : "border-transparent text-gray-700 hover:text-gray-700 hover:border-gray-300"
                                    }
                `}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="min-h-[400px] animate-in fade-in duration-500">
                {children}
            </div>

            <NuevoTicketModal open={openNew} onClose={() => setOpenNew(false)} />
        </div>
    );
}
