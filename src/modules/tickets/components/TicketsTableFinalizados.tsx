'use client';

import { memo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ITicket } from '@/modules/tickets/types';
import { TicketsTable } from './TicketsTable';

const TicketsTableFinalizados = memo(function TicketsTableFinalizados({
  tickets,
  loading,
}: {
  tickets: ITicket[];
  loading: boolean;
}) {
  return (
    <TicketsTable
      tickets={tickets}
      loading={loading}
      minWidthClass="min-w-[920px]"
      loadingUi={
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
          <div className="h-8 bg-gray-100 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-50 rounded"></div>
            ))}
          </div>
        </div>
      }
      emptyUi={
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="bg-gray-50 p-4 rounded-full mb-3">
            <CheckCircle2 className="text-gray-400" size={24} />
          </div>
          <p className="text-gray-500">No hay tickets finalizados.</p>
        </div>
      }
      renderEstado={() => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
          <CheckCircle2 size={14} className="text-green-600" />
          Finalizado
        </span>
      )}
      renderUsuario={(t) => (
        <span className="text-sm text-gray-700">{t.usuario}</span>
      )}
      renderEncargado={(t) => (
        <span className="text-sm text-gray-600">
          {t.encargado || <span className="text-gray-400 italic">—</span>}
        </span>
      )}
    />
  );
});

TicketsTableFinalizados.displayName = 'TicketsTableFinalizados';

export default TicketsTableFinalizados;
