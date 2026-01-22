'use client';
import React, { useState } from "react";
import { ITicket } from "@/modules/tickets/types";
import ReasignarTicketModal from "./modals/ReasignarTicketModal";
import ResponderTicketModal from "./modals/ResponderTicketModal";
import { TicketBadgeEmpresa as Badge } from "./TicketsBadgeEmpresa";
import { Clock, User, MessageSquare, ArrowRightLeft, Calendar, PlayCircle, CheckCircle2 } from "lucide-react";

export default function TicketsCardsActivos({ tickets, loading }: { tickets: ITicket[]; loading: boolean; }) {
  const [openReasign, setOpenReasign] = useState(false);
  const [openResponder, setOpenResponder] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);

  // Función helper para extraer primer nombre y primer apellido
  const getNombreCorto = (nombreCompleto: string): string => {
    if (!nombreCompleto) return "";
    const partes = nombreCompleto.trim().split(/\s+/);
    if (partes.length === 0) return nombreCompleto;
    if (partes.length === 1) return partes[0];
    
    // Si tiene 2 o más partes, asumimos formato: APELLIDO1 APELLIDO2 NOMBRE1 NOMBRE2
    // Extraemos: PRIMER APELLIDO + PRIMER NOMBRE (desde el final)
    const primerApellido = partes[0];
    const primerNombre = partes[partes.length - 2] || partes[partes.length - 1];
    
    // Si solo hay 2 partes, devolver ambas
    if (partes.length === 2) {
      return `${partes[0]} ${partes[1]}`;
    }
    
    return `${primerNombre} ${primerApellido}`;
  };

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
        {tickets.map(t => {
          // Determinar el estilo según el estado que viene del backend
          // El estado viene como "activo" o "en proceso" directamente desde la API
          const isEnProceso = t.estado === "en proceso";
          const estadoDisplay = isEnProceso ? "En Proceso" : "Activo";
          
          // Estilos diferenciados con gradientes profesionales
          const cardStyles = isEnProceso
            ? "group relative bg-gradient-to-br from-[var(--color-primary-light)] via-white to-[var(--color-primary-light)] p-6 rounded-2xl shadow-lg border-2 border-[var(--color-primary)] hover:shadow-xl hover:border-[var(--color-primary-hover)] transition-all duration-300 flex flex-col justify-between overflow-hidden"
            : "group relative bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-6 rounded-2xl shadow-md border-2 border-blue-300 hover:shadow-lg hover:border-blue-400 transition-all duration-300 flex flex-col justify-between overflow-hidden";

          const estadoBadgeStyles = isEnProceso
            ? "px-3 py-1.5 rounded-full text-xs font-bold brand-bg-gradient text-white shadow-md flex items-center gap-1.5"
            : "px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex items-center gap-1.5";

          return (
          <div
            key={t.id}
            className={cardStyles}
          >
            <div>
              {/* Indicador de estado con línea decorativa */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${isEnProceso ? 'brand-bg' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500'}`}></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-bold text-gray-600">#{t.id}</span>
                  <Badge empresa={t.empresa} />
                  <span className={estadoBadgeStyles}>
                    {isEnProceso ? <PlayCircle size={12} /> : <Clock size={12} />}
                    {estadoDisplay}
                  </span>
                  {t.prioridad && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      t.prioridad === 'alta' ? 'bg-red-50 text-red-700 border-red-100' :
                      t.prioridad === 'media' ? 'brand-badge' :
                      'bg-blue-50 text-blue-700 border-blue-100'
                    }`}>
                      {t.prioridad.charAt(0).toUpperCase() + t.prioridad.slice(1)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(t.fechaCreacion).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.tipoSoporte}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                {t.descripcion}
              </p>

              <div className="flex items-center gap-3 flex-wrap mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200">
                  <User size={14} className="text-gray-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuario:</span>
                  <span className="text-sm font-medium text-gray-700">{getNombreCorto(t.usuario)}</span>
                </div>
                {t.encargado && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Encargado:</span>
                    <span className="text-sm font-medium text-indigo-700">{getNombreCorto(t.encargado)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`flex items-center gap-3 pt-4 ${isEnProceso ? 'border-t border-[var(--color-primary)]' : 'border-t border-blue-200'}`}>
              <button
                onClick={() => { setSelectedTicket(t); setOpenReasign(true); }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isEnProceso 
                    ? 'brand-text brand-bg-light hover:bg-[var(--color-primary)]/20 border border-[var(--color-primary)]' 
                    : 'text-blue-700 bg-blue-100 hover:bg-blue-200 border border-blue-300'
                }`}
              >
                <ArrowRightLeft size={16} />
                Reasignar
              </button>
              <button
                onClick={() => { setSelectedTicket(t); setOpenResponder(true); }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-md hover:shadow-lg ${
                  isEnProceso 
                    ? 'brand-bg brand-bg-hover' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <MessageSquare size={16} />
                Responder
              </button>
            </div>
          </div>
        );
        })}
      </div>

      <ReasignarTicketModal
        open={openReasign}
        onClose={() => setOpenReasign(false)}
        ticketId={selectedTicket?.id ?? null}
        currentEncargado={selectedTicket?.encargado}
      />
      <ResponderTicketModal
        open={openResponder}
        onClose={() => setOpenResponder(false)}
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
