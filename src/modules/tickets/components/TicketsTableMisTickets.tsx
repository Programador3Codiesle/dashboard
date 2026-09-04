'use client';

import { memo, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, Clock, MessageSquare } from 'lucide-react';
import { ITicket } from '@/modules/tickets/types';
import { useAuth } from '@/core/auth/hooks/useAuth';
import { puedeReasignarTickets } from '@/modules/tickets/constants';
import { toResponderTicketPayload } from '@/modules/tickets/utils/responder-payload';
import { TicketsTable } from './TicketsTable';
import ReasignarTicketModal from './modals/ReasignarTicketModal';
import ResponderTicketModal from './modals/ResponderTicketModal';

const TicketsTableMisTickets = memo(function TicketsTableMisTickets({
  tickets,
  loading,
}: {
  tickets: ITicket[];
  loading: boolean;
}) {
  const [select, setSelect] = useState<{
    id: number | null;
    action: 'reasign' | 'resp' | null;
  }>({ id: null, action: null });
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const { user } = useAuth();
  const canReasign = puedeReasignarTickets(user?.perfil_postventa);

  return (
    <>
      <TicketsTable
        tickets={tickets}
        loading={loading}
        minWidthClass="min-w-[980px]"
        loadingUi={
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl"></div>
              ))}
            </div>
          </div>
        }
        emptyUi={
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
              <Clock className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Aún no has creado tickets
            </h3>
            <p className="text-gray-500 mt-1">Tus solicitudes aparecerán aquí.</p>
          </div>
        }
        renderEstado={(t) =>
          t.estado === 'cerrado' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
              <CheckCircle2 size={14} className="text-gray-500" />
              Cerrado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
              <Clock size={14} className="text-green-600" />
              Abierto
            </span>
          )
        }
        renderUsuario={(t) => (
          <span className="text-sm font-medium text-gray-700">{t.usuario}</span>
        )}
        renderEncargado={(t) =>
          t.encargado ? (
            <span className="text-sm font-medium text-gray-900">{t.encargado}</span>
          ) : (
            <span className="text-sm text-gray-400 italic">Sin asignar</span>
          )
        }
        renderAcciones={(t) => (
          <div className="flex items-center gap-2 justify-center">
            {canReasign && (
              <button
                disabled={t.estado === 'cerrado'}
                onClick={() => {
                  setSelectedTicket(t);
                  setSelect({ id: t.id, action: 'reasign' });
                }}
                className={`p-2.5 rounded-lg transition-all duration-200 ${
                  t.estado === 'cerrado'
                    ? 'text-gray-300 cursor-not-allowed opacity-50'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                }`}
                title="Reasignar"
              >
                <ArrowRightLeft size={18} />
              </button>
            )}
            <button
              disabled={t.estado === 'cerrado'}
              onClick={() => {
                setSelectedTicket(t);
                setSelect({ id: t.id, action: 'resp' });
              }}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                t.estado === 'cerrado'
                  ? 'text-gray-300 cursor-not-allowed opacity-50'
                  : 'brand-text hover:brand-bg-light hover:shadow-sm hover:scale-105'
              }`}
              title="Responder"
            >
              <MessageSquare size={18} />
            </button>
          </div>
        )}
      />

      <ReasignarTicketModal
        open={select.action === 'reasign'}
        onClose={() => {
          setSelect({ id: null, action: null });
          setSelectedTicket(null);
        }}
        ticketId={selectedTicket?.id ?? null}
        currentEncargado={selectedTicket?.encargado}
      />
      <ResponderTicketModal
        open={select.action === 'resp'}
        onClose={() => {
          setSelect({ id: null, action: null });
          setSelectedTicket(null);
        }}
        ticket={selectedTicket ? toResponderTicketPayload(selectedTicket) : null}
      />
    </>
  );
});

TicketsTableMisTickets.displayName = 'TicketsTableMisTickets';

export default TicketsTableMisTickets;
