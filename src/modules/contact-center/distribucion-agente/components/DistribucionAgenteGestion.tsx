'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ContactCenterPageFrame } from '@/modules/contact-center/components/ContactCenterPageFrame';
import { CONTACT_CENTER_COPY } from '@/modules/contact-center/constants';
import { CcQueryError } from '@/modules/contact-center/shared/components/CcQueryError';
import { useContactCenterPageGuard } from '@/modules/contact-center/shared/hooks/useContactCenterPageGuard';
import { getErrorMessage } from '@/modules/contact-center/shared/utils/get-error-message';
import { DISTRIBUCION_AGENTE_CC_SUBMENU_ID } from '@/utils/constants';
import { distribucionAgenteService, GaRow } from '../services/distribucion-agente.service';

type TabId = 'actuales' | 'futuras' | 'recordacion';

const TABS: { id: TabId; label: string }[] = [
  { id: 'actuales', label: 'Actuales' },
  { id: 'futuras', label: 'Futuras' },
  { id: 'recordacion', label: 'Recordación' },
];

function GaTable({ rows, loading }: { rows: GaRow[]; loading: boolean }) {
  if (loading) return <p className="text-gray-500 text-sm py-4">Cargando...</p>;
  if (rows.length === 0) {
    return <p className="text-gray-500 text-sm py-4">Sin registros.</p>;
  }
  return (
    <div className="app-table-scroll">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-gray-50">
          <tr>
            {['Placa', 'Nombre', 'Familia', 'Campaña', 'KM Estimado', 'Fecha - Hora', 'Estado', 'Tarea'].map(
              (h) => (
                <th key={h} className="px-3 py-2 text-center whitespace-nowrap">{h}</th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.placa}-${i}`} className="border-t text-center">
              <td className="px-3 py-2">{r.placa}</td>
              <td className="px-3 py-2">{r.nombrePropietario}</td>
              <td className="px-3 py-2">{r.modelo}</td>
              <td className="px-3 py-2">{r.campania}</td>
              <td className="px-3 py-2">{r.kmEstimado}</td>
              <td className="px-3 py-2">{r.fechaEstimada}</td>
              <td className="px-3 py-2">{r.estado}</td>
              <td className="px-3 py-2">
                <button
                  type="button"
                  disabled
                  title="Acción no disponible en esta versión"
                  className="text-xs rounded brand-bg text-white px-2 py-1 disabled:opacity-50"
                >
                  Iniciar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DistribucionAgenteGestion() {
  const { user, blocked } = useContactCenterPageGuard(DISTRIBUCION_AGENTE_CC_SUBMENU_ID);
  const [tab, setTab] = useState<TabId>('actuales');

  const actuales = useQuery({
    queryKey: ['contact-center', 'distribucion-agente', 'actuales'],
    queryFn: () => distribucionAgenteService.gaActuales(),
    enabled: !!user && !blocked && tab === 'actuales',
  });

  if (blocked) return null;

  return (
    <ContactCenterPageFrame
      title={CONTACT_CENTER_COPY.distribucionAgente.title}
      description={CONTACT_CENTER_COPY.distribucionAgente.description}
    >
    <div className="space-y-4">
      <div className="app-tabs-scroll gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-[var(--color-primary)] brand-text'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="app-section-card w-full min-w-0">
        <h3 className="font-semibold text-gray-800 mb-3">
          G.A {TABS.find((t) => t.id === tab)?.label}
        </h3>
        {tab !== 'actuales' ? (
          <p className="text-gray-500 text-sm py-4">
            Módulo en construcción (equivalente al placeholder legacy).
          </p>
        ) : actuales.isError ? (
          <CcQueryError
            message={getErrorMessage(actuales.error, 'Error al cargar G.A. actuales')}
          />
        ) : (
          <GaTable rows={actuales.data ?? []} loading={actuales.isLoading} />
        )}
      </div>
    </div>
    </ContactCenterPageFrame>
  );
}
