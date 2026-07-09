'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
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
                <button type="button" className="text-xs rounded bg-sky-500 text-white px-2 py-1">
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
  const [tab, setTab] = useState<TabId>('actuales');

  const actuales = useQuery({
    queryKey: ['contact-center', 'distribucion-agente', 'actuales'],
    queryFn: () => distribucionAgenteService.gaActuales(),
    enabled: tab === 'actuales',
  });

  const futuras = useQuery({
    queryKey: ['contact-center', 'distribucion-agente', 'futuras'],
    queryFn: () => distribucionAgenteService.gaFuturas(),
    enabled: tab === 'futuras',
  });

  const recordacion = useQuery({
    queryKey: ['contact-center', 'distribucion-agente', 'recordacion'],
    queryFn: () => distribucionAgenteService.gaRecordacion(),
    enabled: tab === 'recordacion',
  });

  const activeQuery =
    tab === 'actuales' ? actuales : tab === 'futuras' ? futuras : recordacion;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-[var(--color-primary)] brand-text'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">
          G.A {TABS.find((t) => t.id === tab)?.label}
        </h3>
        {tab !== 'actuales' ? (
          <p className="text-gray-500 text-sm py-4">
            Módulo en construcción (equivalente al placeholder legacy).
          </p>
        ) : (
          <GaTable rows={activeQuery.data ?? []} loading={activeQuery.isLoading} />
        )}
      </div>
    </div>
  );
}
