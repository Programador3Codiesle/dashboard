'use client';

import React, { memo, useCallback, useState } from 'react';
import {
  ArrowRightLeft,
  Calendar,
  Clock,
  MessageSquare,
  PlayCircle,
  User,
} from 'lucide-react';
import { ITicket } from '@/modules/tickets/types';
import {
  TICKETS_BADGE_ACTIVO_CLASS,
  TICKETS_BADGE_EN_PROCESO_CLASS,
  TICKETS_CARD_ACTIVO_CLASS,
  TICKETS_CARD_EN_PROCESO_CLASS,
} from '@/modules/tickets/constants';
import { getNombreCorto } from '@/modules/tickets/utils/nombre-corto';
import { toResponderTicketPayload } from '@/modules/tickets/utils/responder-payload';
import ReasignarTicketModal from './modals/ReasignarTicketModal';
import ResponderTicketModal from './modals/ResponderTicketModal';
import { TicketBadgeEmpresa as Badge } from './TicketsBadgeEmpresa';

interface TicketsCardsActivosProps {
  tickets: ITicket[];
  loading: boolean;
}

function TicketsCardsActivosComponent({
  tickets,
  loading,
}: TicketsCardsActivosProps) {
  const [openReasign, setOpenReasign] = useState(false);
  const [openResponder, setOpenResponder] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);

  const handleReasignar = useCallback((t: ITicket) => {
    setSelectedTicket(t);
    setOpenReasign(true);
  }, []);

  const handleResponder = useCallback((t: ITicket) => {
    setSelectedTicket(t);
    setOpenResponder(true);
  }, []);

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-2xl"></div>
        ))}
      </div>
    );

  if (!tickets.length)
    return (
      <div
        data-testid="tickets-empty"
        className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200"
      >
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <MessageSquare className="text-gray-400" size={24} />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No hay tickets activos</h3>
        <p className="text-gray-500 mt-1">Todo está bajo control por ahora.</p>
      </div>
    );

  return (
    <>
      <div
        data-testid="tickets-cards"
        className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6"
      >
        {tickets.map((t) => {
          const isEnProceso = t.estado === 'en proceso';
          const estadoDisplay = isEnProceso ? 'En Proceso' : 'Activo';
          const cardStyles = isEnProceso
            ? TICKETS_CARD_EN_PROCESO_CLASS
            : TICKETS_CARD_ACTIVO_CLASS;
          const estadoBadgeStyles = isEnProceso
            ? TICKETS_BADGE_EN_PROCESO_CLASS
            : TICKETS_BADGE_ACTIVO_CLASS;

          return (
            <div key={t.id} className={cardStyles}>
              <div>
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${isEnProceso ? 'brand-bg' : 'brand-bg/70'}`}
                ></div>

                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-bold text-gray-600">#{t.id}</span>
                    <Badge empresa={t.empresa} />
                    <span className={estadoBadgeStyles}>
                      {isEnProceso ? <PlayCircle size={12} /> : <Clock size={12} />}
                      {estadoDisplay}
                    </span>
                    {t.prioridad && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          t.prioridad === 'alta'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : t.prioridad === 'media'
                              ? 'brand-badge'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {t.prioridad.charAt(0).toUpperCase() + t.prioridad.slice(1)}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                    <Calendar size={12} />
                    {new Date(t.fechaCreacion).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.tipoSoporte}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {t.descripcion}
                </p>

                <div className="flex items-center gap-3 flex-wrap mb-6">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200">
                    <User size={14} className="text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Usuario:
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {getNombreCorto(t.usuario)}
                    </span>
                  </div>
                  {t.encargado && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg brand-bg-light brand-border border">
                      <div className="w-2 h-2 rounded-full brand-bg"></div>
                      <span className="text-xs font-semibold brand-text uppercase tracking-wide">
                        Encargado:
                      </span>
                      <span className="text-sm font-medium brand-text">
                        {getNombreCorto(t.encargado)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 ${isEnProceso ? 'border-t border-(--color-primary)' : 'border-t brand-border'}`}
              >
                <button
                  type="button"
                  onClick={() => handleReasignar(t)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all brand-text brand-bg-light hover:bg-(--color-primary)/20 border brand-border"
                >
                  <ArrowRightLeft size={16} />
                  Reasignar
                </button>
                <button
                  type="button"
                  onClick={() => handleResponder(t)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all shadow-md hover:shadow-lg brand-bg brand-bg-hover"
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
        ticket={selectedTicket ? toResponderTicketPayload(selectedTicket) : null}
      />
    </>
  );
}

const TicketsCardsActivos = memo(TicketsCardsActivosComponent);
export default TicketsCardsActivos;
