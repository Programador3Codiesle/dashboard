'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { auditoriaService } from '@/modules/auditoria/shared/services/auditoria.service';
import { NPS_FABRICA_SUBMENU_ID } from '@/utils/constants';

const SEDE_LABELS: Record<string, string> = {
  giron: 'Girón',
  rosita: 'La Rosita',
  barranca: 'Barranca',
  bocono: 'Bocono',
  general: 'General',
};

const SEDES_TEC = ['giron', 'rosita', 'barranca', 'bocono'] as const;
const ENC_COLORS = ['#c0504d', '#f2c14e', '#4f81bc'];

type Modo = 'sede' | 'tecnico';

type SedeDetalle = {
  sede: string;
  fecha: string;
  calificacion: number;
  enc06: number;
  enc78: number;
  enc910: number;
};

type SedeResponse = {
  calificaciones: Record<string, number>;
  detalles: SedeDetalle[];
};

type TecnicoDetalle = {
  nombres: string;
  enc06: number;
  enc78: number;
  enc910: number;
};

type TecnicoSedeData = {
  agregado: { enc06: number; enc78: number; enc910: number };
  detalle: TecnicoDetalle[];
};

function currentYm() {
  return new Date().toISOString().slice(0, 7);
}

function npsFromEnc(enc06: number, enc78: number, enc910: number) {
  const total = enc06 + enc78 + enc910;
  if (!total) return 0;
  return Math.round(((enc910 - enc06) / total) * 10000) / 100;
}

export function NpsFabricaGestion() {
  const { blocked } = useAuditoriaPageGuard(NPS_FABRICA_SUBMENU_ID);
  const { showError } = useToast();
  const [modo, setModo] = useState<Modo>('sede');
  const [fecha, setFecha] = useState(currentYm);
  const [sedeTec, setSedeTec] = useState('');
  const [loading, setLoading] = useState(false);
  const [sedeData, setSedeData] = useState<SedeResponse | null>(null);
  const [tecData, setTecData] = useState<Record<string, TecnicoSedeData> | null>(
    null,
  );

  const chartSedes = useMemo(() => {
    if (!sedeData) return [];
    return Object.entries(sedeData.calificaciones).map(([sede, calificacion]) => ({
      sede: SEDE_LABELS[sede] ?? sede,
      calificacion,
    }));
  }, [sedeData]);

  async function buscar() {
    if (!fecha) {
      showError('Seleccione el mes');
      return;
    }
    setLoading(true);
    try {
      if (modo === 'sede') {
        const data = (await auditoriaService.npsFabricaSedes(fecha)) as SedeResponse;
        setSedeData(data);
        setTecData(null);
      } else {
        const data = (await auditoriaService.npsFabricaTecnicos(
          fecha,
          sedeTec || undefined,
        )) as Record<string, TecnicoSedeData>;
        setTecData(data);
        setSedeData(null);
      }
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Error al consultar NPS');
      setSedeData(null);
      setTecData(null);
    } finally {
      setLoading(false);
    }
  }

  if (blocked) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="app-title-xl brand-text">NPS Fábrica</h1>
        <Link href="/dashboard/auditoria" className="text-sm text-amber-700 hover:underline">
          ← Volver a Auditoría
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border bg-white p-4 shadow-sm">
        <fieldset className="text-sm">
          <legend className="mb-1 font-medium">Tipo de informe</legend>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="modo-nps"
                checked={modo === 'sede'}
                onChange={() => setModo('sede')}
              />
              Ver por sede
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="modo-nps"
                checked={modo === 'tecnico'}
                onChange={() => setModo('tecnico')}
              />
              Ver por técnico
            </label>
          </div>
        </fieldset>

        <label className="text-sm">
          Mes
          <input
            type="month"
            className="mt-1 block rounded border px-3 py-2"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>

        {modo === 'tecnico' && (
          <label className="text-sm min-w-[180px]">
            Sede (opcional)
            <select
              className="mt-1 block w-full rounded border px-3 py-2"
              value={sedeTec}
              onChange={(e) => setSedeTec(e.target.value)}
            >
              <option value="">Todas</option>
              {SEDES_TEC.map((s) => (
                <option key={s} value={s}>
                  {SEDE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={buscar}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-(--color-primary) px-4 py-2 text-sm font-semibold text-white"
        >
          <Search className="h-4 w-4" /> Buscar
        </button>
      </div>

      {loading && (
        <p className="text-center text-sm text-gray-500 py-8">Cargando informe...</p>
      )}

      {!loading && modo === 'sede' && sedeData && (
        <Panel title="Calificación NPS por sede">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSedes} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="sede" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="calificacion"
                  name="Calificación NPS"
                  fill="#4f81bc"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-(--color-primary) text-white">
                <tr>
                  {['SEDE', 'FECHA', 'NPS', 'ENC 0-6', 'ENC 7-8', 'ENC 9-10'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-center font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sedeData.detalles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      Sin detalle para el mes seleccionado
                    </td>
                  </tr>
                ) : (
                  sedeData.detalles.map((d) => (
                    <tr key={d.sede} className="border-t text-center">
                      <td className="px-3 py-2 text-left">
                        {SEDE_LABELS[d.sede] ?? d.sede}
                      </td>
                      <td className="px-3 py-2">{d.fecha?.slice?.(0, 10) ?? d.fecha}</td>
                      <td className="px-3 py-2 font-semibold">{d.calificacion.toFixed(1)}</td>
                      <td className="px-3 py-2">{d.enc06}</td>
                      <td className="px-3 py-2">{d.enc78}</td>
                      <td className="px-3 py-2">{d.enc910}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {!loading && modo === 'tecnico' && tecData && (
        <div className="grid gap-4 lg:grid-cols-2">
          {Object.entries(tecData).map(([sede, data]) => {
            const pie = [
              { name: 'Enc 0-6', value: data.agregado.enc06 },
              { name: 'Enc 7-8', value: data.agregado.enc78 },
              { name: 'Enc 9-10', value: data.agregado.enc910 },
            ];
            const nps = npsFromEnc(
              data.agregado.enc06,
              data.agregado.enc78,
              data.agregado.enc910,
            );
            return (
              <Panel
                key={sede}
                title={`${SEDE_LABELS[sede] ?? sede} — NPS ${nps.toFixed(1)}`}
              >
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pie}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label
                      >
                        {pie.map((_, i) => (
                          <Cell key={i} fill={ENC_COLORS[i % ENC_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full text-xs md:text-sm">
                    <thead className="bg-(--color-primary) text-white">
                      <tr>
                        {['TÉCNICO', 'ENC 0-6', 'ENC 7-8', 'ENC 9-10', 'NPS'].map((h) => (
                          <th key={h} className="px-2 py-2 text-center font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.detalle.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-500">
                            Sin técnicos
                          </td>
                        </tr>
                      ) : (
                        data.detalle.map((t) => (
                          <tr key={t.nombres} className="border-t text-center">
                            <td className="px-2 py-1.5 text-left">{t.nombres}</td>
                            <td className="px-2 py-1.5">{t.enc06}</td>
                            <td className="px-2 py-1.5">{t.enc78}</td>
                            <td className="px-2 py-1.5">{t.enc910}</td>
                            <td className="px-2 py-1.5 font-semibold">
                              {npsFromEnc(t.enc06, t.enc78, t.enc910).toFixed(1)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  );
}
