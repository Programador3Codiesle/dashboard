'use client';
import React, { useMemo, useEffect } from "react";
import { ITicket } from "@/modules/tickets/types";
import { TicketBadgeEmpresa } from "./TicketsBadgeEmpresa";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";

export default function TicketsTableFinalizados({ tickets, loading }: { tickets: ITicket[]; loading: boolean; }) {
    // Paginación: 10 items por página
    const {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        changePage,
    } = usePagination(tickets.length, 5);

    // Resetear a página 1 si la página actual está fuera de rango
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            changePage(1);
        }
    }, [tickets.length, currentPage, totalPages, changePage]);

    const ticketsMostrados = useMemo(() => tickets.slice(startIndex, endIndex), [tickets, startIndex, endIndex]);

    if (loading) return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="h-8 bg-gray-100 rounded mb-4 w-1/3"></div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded"></div>)}
            </div>
        </div>
    );

    if (!tickets.length) return (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
                <CheckCircle2 className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500">No hay tickets finalizados.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="brand-bg-gradient border-b-2 border-[var(--color-primary-dark)] text-center">
                            <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Ticket</th>
                            <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Estado</th>
                            <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Prioridad</th>
                            <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Soporte</th>
                            <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Usuario</th>
                            <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Encargado</th>
                            <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {ticketsMostrados.map((t, index) => (
                            <tr 
                                key={t.id} 
                                className={`transition-all duration-200 ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                } hover:brand-bg-light hover:shadow-sm text-center`}
                            >
                                <td className="py-5 px-6 whitespace-nowrap">
                                    <span className="text-sm font-bold text-gray-900">#{t.id}</span>
                                </td>
                                <td className="py-5 px-6 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                                        <CheckCircle2 size={14} className="text-green-600" />
                                        Finalizado
                                    </span>
                                </td>
                                <td className="py-5 px-6 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shadow-sm ${
                                        t.prioridad === 'alta' 
                                            ? 'bg-red-100 text-red-700 border border-red-200' 
                                            : t.prioridad === 'media' 
                                            ? 'brand-badge border border-[var(--color-primary)]' 
                                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                                    }`}>
                                        {t.prioridad}
                                    </span>
                                </td>
                                <td className="py-5 px-6 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-700">{t.tipoSoporte}</span>
                                </td>
                                <td className="py-5 px-6 whitespace-nowrap">
                                    <span className="text-sm text-gray-700">{t.usuario}</span>
                                </td>
                                <td className="py-5 px-6 whitespace-nowrap">
                                    <span className="text-sm text-gray-600">{t.encargado || <span className="text-gray-400 italic">—</span>}</span>
                                </td>
                                <td className="py-5 px-6 whitespace-nowrap">
                                    <span className="text-sm text-gray-600">{new Date(t.fechaCreacion).toLocaleDateString()}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
                <div className="mt-6 px-6 pb-6 bg-gray-50/50 border-t border-gray-200 pt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onChange={changePage}
                    />
                </div>
            )}
        </div>
    );
}
