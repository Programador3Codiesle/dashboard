'use client';
import React, { useState } from "react";
import { ITicket } from "@/modules/tickets/types";
import ReasignarTicketModal from "./modals/ReasignarTicketModal";
import ResponderTicketModal from "./modals/ResponderTicketModal";
import { TicketBadgeEmpresa as Badge } from "./TicketsBadgeEmpresa";
import { Clock, User, MessageSquare, ArrowRightLeft, Calendar } from "lucide-react";

export default function TicketsCardsActivos({ tickets, loading }: { tickets: ITicket[]; loading: boolean; }) {
  const [openReasign, setOpenReasign] = useState(false);
  const [openResponder, setOpenResponder] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-48 bg-gray-100 rounded-2xl"></div>
      ))}
    </div>
  );

  if (!tickets.length) return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
        <MessageSquare className="text-gray-400" size={24} />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No hay tickets activos</h3>
      <p className="text-gray-500 mt-1">Todo está bajo control por ahora.</p>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tickets.map(t => (
          <div
            key={t.id}
            className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400">#{t.id}</span>
                  <Badge empresa={t.empresa} />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${t.prioridad === 'alta' ? 'bg-red-50 text-red-700 border-red-100' :
                      t.prioridad === 'media' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                    {t.prioridad.charAt(0).toUpperCase() + t.prioridad.slice(1)}
                  </span>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(t.fechaCreacion).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.tipoSoporte}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                {t.descripcion}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <User size={14} />
                  <span>{t.usuario}</span>
                </div>
                {t.encargado && (
                  <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>{t.encargado}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
              <button
                onClick={() => { setSelectedTicket(t); setOpenReasign(true); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <ArrowRightLeft size={16} />
                Reasignar
              </button>
              <button
                onClick={() => { setSelectedTicket(t); setOpenResponder(true); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-black transition-colors shadow-sm"
              >
                <MessageSquare size={16} />
                Responder
              </button>
            </div>
          </div>
        ))}
      </div>

      <ReasignarTicketModal open={openReasign} onClose={() => setOpenReasign(false)} ticketId={selectedTicket?.id ?? null} currentEncargado={selectedTicket?.encargado} />
      <ResponderTicketModal open={openResponder} onClose={() => setOpenResponder(false)} ticket={selectedTicket ? { id: selectedTicket.id, usuario: selectedTicket.usuario, anydesk: selectedTicket.anydesk, tipoSoporte: selectedTicket.tipoSoporte, descripcion: selectedTicket.descripcion } : null} />
    </>
  );
}
