'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { retencion720Service } from '@/modules/informes/postventa/services/retencion-72-0.service';
import { Retencion72BarChart } from '@/modules/informes/postventa/components/Retencion72BarChart';

const TRAMOS = [
  { label: '12-0', p: 'p0_12', e: 'e0_12' },
  { label: '24-12', p: 'p13_24', e: 'e13_24' },
  { label: '36-24', p: 'p25_36', e: 'e25_36' },
  { label: '48-36', p: 'p37_48', e: 'e37_48' },
  { label: '60-48', p: 'p49_60', e: 'e49_60' },
  { label: '72-60', p: 'p61_72', e: 'e61_72' },
] as const;

function pct(e: number, p: number) {
  if (!p) return 0;
  return (e / p) * 100;
}

export default function Retencion720ComparacionVsPage() {
  const [filtro, setFiltro] = useState('Autos');

  const generalVsQuery = useQuery({
    queryKey: ['retencion-72-0', 'vs', 'general'],
    queryFn: () => retencion720Service.obtenerVsGeneral(),
    staleTime: 60 * 1000,
  });

  const autosByCVsQuery = useQuery({
    queryKey: ['retencion-72-0', 'vs', 'autos-byc', filtro],
    queryFn: () => retencion720Service.obtenerVsAutosByC(filtro),
    staleTime: 60 * 1000,
  });

  const principal = autosByCVsQuery.data ?? [];
  const base = generalVsQuery.data ?? [];

  const totalPrincipal = principal.reduce(
    (acc, r) => ({
      p0_12: acc.p0_12 + r.p0_12,
      e0_12: acc.e0_12 + r.e0_12,
      p13_24: acc.p13_24 + r.p13_24,
      e13_24: acc.e13_24 + r.e13_24,
      p25_36: acc.p25_36 + r.p25_36,
      e25_36: acc.e25_36 + r.e25_36,
      p37_48: acc.p37_48 + r.p37_48,
      e37_48: acc.e37_48 + r.e37_48,
      p49_60: acc.p49_60 + r.p49_60,
      e49_60: acc.e49_60 + r.e49_60,
      p61_72: acc.p61_72 + r.p61_72,
      e61_72: acc.e61_72 + r.e61_72,
    }),
    {
      p0_12: 0,
      e0_12: 0,
      p13_24: 0,
      e13_24: 0,
      p25_36: 0,
      e25_36: 0,
      p37_48: 0,
      e37_48: 0,
      p49_60: 0,
      e49_60: 0,
      p61_72: 0,
      e61_72: 0,
    },
  );

  const totalBase = base.reduce(
    (acc, r) => ({
      p0_12: acc.p0_12 + r.p0_12,
      e0_12: acc.e0_12 + r.e0_12,
      p13_24: acc.p13_24 + r.p13_24,
      e13_24: acc.e13_24 + r.e13_24,
      p25_36: acc.p25_36 + r.p25_36,
      e25_36: acc.e25_36 + r.e25_36,
      p37_48: acc.p37_48 + r.p37_48,
      e37_48: acc.e37_48 + r.e37_48,
      p49_60: acc.p49_60 + r.p49_60,
      e49_60: acc.e49_60 + r.e49_60,
      p61_72: acc.p61_72 + r.p61_72,
      e61_72: acc.e61_72 + r.e61_72,
    }),
    {
      p0_12: 0,
      e0_12: 0,
      p13_24: 0,
      e13_24: 0,
      p25_36: 0,
      e25_36: 0,
      p37_48: 0,
      e37_48: 0,
      p49_60: 0,
      e49_60: 0,
      p61_72: 0,
      e61_72: 0,
    },
  );

  const data = TRAMOS.map((t) => ({
    label: t.label,
    valor: pct(totalPrincipal[t.e], totalPrincipal[t.p]),
    comparacion: pct(totalBase[t.e], totalBase[t.p]),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold brand-text">Comparación Vs - Retención 72-0</h1>
        <p className="text-sm text-gray-500">Equivalente a grafGeneralVs y GrafAutosyByCVs.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border brand-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm text-gray-700">Comparar filtro</label>
          <input
            className="border rounded px-2 py-1 text-sm"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Autos, B&C o segmento"
          />
        </div>

        {generalVsQuery.isPending || autosByCVsQuery.isPending ? (
          <div className="py-10 flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={18} />
            Cargando comparación...
          </div>
        ) : generalVsQuery.isError || autosByCVsQuery.isError ? (
          <div className="py-8 text-center text-red-600 text-sm">
            No se pudo cargar la comparación.
          </div>
        ) : (
          <Retencion72BarChart
            title="Retención total por tramo"
            data={data}
            labelPrincipal={`Filtro (${filtro})`}
            labelComparacion="General"
          />
        )}
      </div>
    </div>
  );
}

