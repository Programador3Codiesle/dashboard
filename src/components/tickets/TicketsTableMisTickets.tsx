'use client';
import React, { useState } from "react";
import { ITicket } from "@/modules/tickets/types";
import { TicketBadgeEmpresa } from "./TicketsBadgeEmpresa";
import ReasignarTicketModal from "./modals/ReasignarTicketModal";
import ResponderTicketModal from "./modals/ResponderTicketModal";
import { MessageSquare, ArrowRightLeft, MoreHorizontal, CheckCircle2, Clock } from "lucide-react";

export default function TicketsTableMisTickets({ tickets, loading }: { tickets: ITicket[]; loading: boolean; }) {
    const [select, setSelect] = useState<{ id: number | null; action: "reasign" | "resp" | null }>({ id: null, action: null });

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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left ">
                        <thead>
                            <tr className="bg-amber-500 border-b border-amber-500 text-white">
                                <th className="py-4 px-6 font-medium ">Ticket</th>
                                <th className="py-4 px-6 font-medium ">Estado</th>
                                <th className="py-4 px-6 font-medium ">Empresa</th>
                                <th className="py-4 px-6 font-medium ">Prioridad</th>
                                <th className="py-4 px-6 font-medium ">Soporte</th>
                                <th className="py-4 px-6 font-medium ">Encargado</th>
                                <th className="py-4 px-6 font-medium ">Fecha</th>
                                <th className="py-4 px-6 font-medium ">Acciones</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50 text-sm">
                            {tickets.map(t => (
                                <tr key={t.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">#{t.id}</td>
                                    <td className="py-4 px-6">
                                        {t.estado === 'cerrado' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                <CheckCircle2 size={12} />
                                                Cerrado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                <Clock size={12} />
                                                Abierto
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6"><TicketBadgeEmpresa empresa={t.empresa} /></td>
                                    <td className="py-4 px-6">
                                        <span className={`capitalize ${t.prioridad === 'alta' ? 'text-red-600 font-medium' :
                                                t.prioridad === 'media' ? 'text-amber-600' : 'text-blue-600'
                                            }`}>
                                            {t.prioridad}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">{t.tipoSoporte}</td>
                                    <td className="py-4 px-6">
                                        {t.encargado ? (
                                            <span className="text-gray-900 font-medium">{t.encargado}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Sin asignar</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-gray-500">{new Date(t.fechaCreacion).toLocaleDateString()}</td>
                                    <td className="py-4 px-6 ">
                                        <div className="flex items-center gap-2 ">
                                            <button
                                                disabled={t.estado === "cerrado"}
                                                onClick={() => setSelect({ id: t.id, action: "reasign" })}
                                                className={`p-2 rounded-lg transition-colors ${t.estado === "cerrado"
                                                        ? "text-gray-300 cursor-not-allowed"
                                                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                                                    }`}
                                                title="Reasignar"
                                            >
                                                <ArrowRightLeft size={16} />
                                            </button>

                                            <button
                                                disabled={t.estado === "cerrado"}
                                                onClick={() => setSelect({ id: t.id, action: "resp" })}
                                                className={`p-2 rounded-lg transition-colors ${t.estado === "cerrado"
                                                        ? "text-gray-300 cursor-not-allowed"
                                                        : "text-blue-600 hover:bg-blue-50"
                                                    }`}
                                                title="Responder"
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ReasignarTicketModal open={select.action === "reasign"} onClose={() => setSelect({ id: null, action: null })} ticketId={select.id} />
            <ResponderTicketModal open={select.action === "resp"} onClose={() => setSelect({ id: null, action: null })} ticket={select.id ? { id: select.id, usuario: "", anydesk: "", tipoSoporte: "", descripcion: "" } : null} />
        </>
    );
}
