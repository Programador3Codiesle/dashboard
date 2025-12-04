'use client';
import React from "react";
import { ITicket } from "@/modules/tickets/types";
import { TicketBadgeEmpresa } from "./TicketsBadgeEmpresa";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function TicketsTableFinalizados({ tickets, loading }: { tickets: ITicket[]; loading: boolean; }) {
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left ">
                    <thead>
                        <tr className="bg-amber-500 border-b border-amber-500">
                            <th className="py-4 px-6 font-medium text-gray-700">Ticket</th>
                            <th className="py-4 px-6 font-medium text-gray-700">Estado</th>
                            <th className="py-4 px-6 font-medium text-gray-700">Empresa</th>
                            <th className="py-4 px-6 font-medium text-gray-700">Prioridad</th>
                            <th className="py-4 px-6 font-medium text-gray-700">Soporte</th>
                            <th className="py-4 px-6 font-medium text-gray-700">Usuario</th>
                            <th className="py-4 px-6 font-medium text-gray-700">Encargado</th>
                            <th className="py-4 px-6 font-medium text-gray-700">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {tickets.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-6 font-medium text-gray-900">#{t.id}</td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                        <CheckCircle2 size={12} />
                                        Finalizado
                                    </span>
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
                                <td className="py-4 px-6 text-gray-600">{t.usuario}</td>
                                <td className="py-4 px-6 text-gray-600">{t.encargado || "—"}</td>
                                <td className="py-4 px-6 text-gray-500">{new Date(t.fechaCreacion).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
