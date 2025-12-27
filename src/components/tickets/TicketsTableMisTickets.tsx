'use client';
import React, { useState, useMemo, useEffect } from "react";
import { ITicket } from "@/modules/tickets/types";
import { TicketBadgeEmpresa } from "./TicketsBadgeEmpresa";
import ReasignarTicketModal from "./modals/ReasignarTicketModal";
import ResponderTicketModal from "./modals/ResponderTicketModal";
import { MessageSquare, ArrowRightLeft, MoreHorizontal, CheckCircle2, Clock } from "lucide-react";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { useAuth } from "@/core/auth/hooks/useAuth";

export default function TicketsTableMisTickets({ tickets, loading }: { tickets: ITicket[]; loading: boolean; }) {
    const [select, setSelect] = useState<{ id: number | null; action: "reasign" | "resp" | null }>({ id: null, action: null });
    const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
    const { user } = useAuth();
    
    // Solo usuarios con perfil "20" o "2" pueden reasignar tickets
    const canReasign = user?.perfil_postventa === "20" || user?.perfil_postventa === "2";

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
            <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl"></div>)}
            </div>
        </div>
    );

    if (!tickets.length) return (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
                <Clock className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Aún no has creado tickets</h3>
            <p className="text-gray-500 mt-1">Tus solicitudes aparecerán aquí.</p>
        </div>
    );

    return (
        <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-linear-to-r from-amber-500 to-amber-600 border-b-2 border-amber-600 text-center">
                                <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Ticket</th>
                                <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Estado</th>
                                <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Prioridad</th>
                                <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Soporte</th>
                                <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Usuario</th>
                                <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Encargado</th>
                                <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Fecha</th>
                                <th className="py-5 px-6  text-sm font-bold text-white uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-100">
                            {ticketsMostrados.map((t, index) => (
                                <tr 
                                    key={t.id} 
                                    className={`transition-all duration-200 ${
                                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                    } hover:bg-amber-50/50 hover:shadow-sm text-center`}
                                >
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-900">#{t.id}</span>
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        {t.estado === 'cerrado' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                                                <CheckCircle2 size={14} className="text-gray-500" />
                                                Cerrado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                                                <Clock size={14} className="text-green-600" />
                                                Abierto
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold capitalize shadow-sm ${
                                            t.prioridad === 'alta' 
                                                ? 'bg-red-100 text-red-700 border border-red-200' 
                                                : t.prioridad === 'media' 
                                                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                                        }`}>
                                            {t.prioridad}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-700">{t.tipoSoporte}</span>
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-700">{t.usuario}</span>
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        {t.encargado ? (
                                            <span className="text-sm font-medium text-gray-900">{t.encargado}</span>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">Sin asignar</span>
                                        )}
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        <span className="text-sm text-gray-600">{new Date(t.fechaCreacion).toLocaleDateString()}</span>
                                    </td>
                                    <td className="py-5 px-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2 justify-center">
                                            {/* Botón de Reasignar: Solo visible para perfiles 20 o 2 */}
                                            {canReasign && (
                                                <button
                                                    disabled={t.estado === "cerrado"}
                                                    onClick={() => {
                                                        setSelectedTicket(t);
                                                        setSelect({ id: t.id, action: "reasign" });
                                                    }}
                                                    className={`p-2.5 rounded-lg transition-all duration-200 ${
                                                        t.estado === "cerrado"
                                                            ? "text-gray-300 cursor-not-allowed opacity-50"
                                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                                                    }`}
                                                    title="Reasignar"
                                                >
                                                    <ArrowRightLeft size={18} />
                                                </button>
                                            )}

                                            {/* Botón de Responder: Visible para todos los perfiles */}
                                            <button
                                                disabled={t.estado === "cerrado"}
                                                onClick={() => {
                                                    setSelectedTicket(t);
                                                    setSelect({ id: t.id, action: "resp" });
                                                }}
                                                className={`p-2.5 rounded-lg transition-all duration-200 ${
                                                    t.estado === "cerrado"
                                                        ? "text-gray-300 cursor-not-allowed opacity-50"
                                                        : "text-blue-600 hover:bg-blue-50 hover:shadow-sm hover:scale-105"
                                                }`}
                                                title="Responder"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                        </div>
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

            <ReasignarTicketModal
                open={select.action === "reasign"}
                onClose={() => {
                    setSelect({ id: null, action: null });
                    setSelectedTicket(null);
                }}
                ticketId={selectedTicket?.id ?? null}
                currentEncargado={selectedTicket?.encargado}
            />
            <ResponderTicketModal
                open={select.action === "resp"}
                onClose={() => {
                    setSelect({ id: null, action: null });
                    setSelectedTicket(null);
                }}
                ticket={selectedTicket
                    ? {
                        id: selectedTicket.id,
                        usuario: selectedTicket.usuario,
                        anydesk: selectedTicket.anydesk,
                        tipoSoporte: selectedTicket.tipoSoporte,
                        descripcion: selectedTicket.descripcion,
                        archivoUrl: selectedTicket.archivoUrl ?? null,
                    }
                    : null}
            />
        </>
    );
}
