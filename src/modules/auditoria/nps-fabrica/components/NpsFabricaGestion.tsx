'use client';

import { useState, type ReactNode } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
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
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { useToast } from '@/components/ui/use-toast';
import { AuditoriaPageFrame } from '@/modules/auditoria/components/AuditoriaPageFrame';
import { AUDITORIA_COPY } from '@/modules/auditoria/constants';
import { AuditoriaQueryError } from '@/modules/auditoria/shared/components/AuditoriaQueryError';
import { auditoriaKeys } from '@/modules/auditoria/shared/constants/query-keys';
import {
  btnPrimaryClass,
  inputClass,
} from '@/modules/auditoria/shared/constants/ui';
import { useAuditoriaPageGuard } from '@/modules/auditoria/shared/hooks/useAuditoriaPageGuard';
import { auditoriaService } from '@/modules/auditoria/shared/services/auditoria.service';
import { getErrorMessage } from '@/modules/auditoria/shared/utils/parse-api-error';
import { NPS_FABRICA_SUBMENU_ID } from '@/utils/constants';

const SEDE_LABELS: Record<string, string> = {
  giron: 'Girón',
  rosita: 'La Rosita',
  barranca: 'Barranca',
  bocono: 'Bocono',
  general: 'General',
};

const SEDES_TEC = ['giron', 'rosita', 'barranca', 'bocono'] as const;
const ENC_COLORS = [
  'var(--color-danger)',
  'var(--color-warning)',
  'var(--color-info)',
];

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
  const { user, blocked } = useAuditoriaPageGuard(NPS_FABRICA_SUBMENU_ID);
  const { showError } = useToast();
  const sesionLista = !!user && !blocked;
  const [modo, setModo] = useState<Modo>('sede');
  const [fecha, setFecha] = useState(currentYm);
  const [sedeTec, setSedeTec] = useState('');
  const [applied, setApplied] = useState<{
    modo: Modo;
    fecha: string;
    sede: string;
  } | null>(null);

  const sedeQuery = useQuery({
    queryKey: auditoriaKeys.npsSedes(applied?.fecha ?? ''),
    queryFn: () =>
      auditoriaService.npsFabricaSedes(applied!.fecha) as Promise<SedeResponse>,
    enabled: sesionLista && applied?.modo === 'sede',
    ...transactionalQueryOptions,
  });

  const tecQuery = useQuery({
    queryKey: auditoriaKeys.npsTecnicos(
      applied?.fecha ?? '',
      applied?.sede ?? '',
    ),
    queryFn: () =>
      auditoriaService.npsFabricaTecnicos(
        applied!.fecha,
        applied!.sede || undefined,
      ) as Promise<Record<string, TecnicoSedeData>>,
    enabled: sesionLista && applied?.modo === 'tecnico',
    ...transactionalQueryOptions,
  });

  const sedeData = sedeQuery.data ?? null;
  const tecData = tecQuery.data ?? null;
  const loading = sedeQuery.isFetching || tecQuery.isFetching;
  const queryError = sedeQuery.error ?? tecQuery.error;

  const chartSedes = Object.entries(sedeData?.calificaciones ?? {}).map(
    ([sede, calificacion]) => ({
      sede: SEDE_LABELS[sede] ?? sede,
      calificacion,
    }),
  );

  if (blocked) return null;

  return (
    <AuditoriaPageFrame
      title={AUDITORIA_COPY.npsFabrica.title}
      description={AUDITORIA_COPY.npsFabrica.description}
      backLabel={AUDITORIA_COPY.backLabel}
    >
      <div className="app-section-card w-full min-w-0">
        <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <fieldset className="w-full min-w-0 text-sm sm:w-auto">
            <legend className="mb-1 font-medium">Tipo de informe</legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
              <label htmlFor="aud-nps-modo-sede" className="inline-flex items-center gap-2">
                <input
                  id="aud-nps-modo-sede"
                  type="radio"
                  name="modo-nps"
                  checked={modo === 'sede'}
                  onChange={() => setModo('sede')}
                />
                Ver por sede
              </label>
              <label htmlFor="aud-nps-modo-tec" className="inline-flex items-center gap-2">
                <input
                  id="aud-nps-modo-tec"
                  type="radio"
                  name="modo-nps"
                  checked={modo === 'tecnico'}
                  onChange={() => setModo('tecnico')}
                />
                Ver por técnico
              </label>
            </div>
          </fieldset>

          <label htmlFor="aud-nps-mes" className="w-full min-w-0 text-sm sm:w-auto">
            Mes
            <input
              id="aud-nps-mes"
              type="month"
              className={inputClass}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>

          {modo === 'tecnico' ? (
            <label htmlFor="aud-nps-sede" className="w-full min-w-0 text-sm sm:w-auto sm:min-w-[12rem]">
              Sede (opcional)
              <select
                id="aud-nps-sede"
                className={inputClass}
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
          ) : null}

          <button
            type="button"
            className={btnPrimaryClass}
            disabled={loading}
            onClick={() => {
              if (!fecha) {
                showError('Seleccione el mes');
                return;
              }
              setApplied({ modo, fecha, sede: sedeTec });
            }}
          >
            <Search className="h-4 w-4" /> Buscar
          </button>
        </div>
      </div>

      {queryError ? (
        <AuditoriaQueryError
          message={getErrorMessage(
            queryError,
            AUDITORIA_COPY.npsFabrica.loadError,
          )}
        />
      ) : null}

      {loading ? (
        <p className="py-8 text-center text-sm text-gray-500">
          Cargando informe...
        </p>
      ) : null}

      {!loading && applied?.modo === 'sede' && sedeData ? (
        <Panel title="Calificación NPS por sede">
          <div className="h-[240px] w-full min-w-0 sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartSedes}
                margin={{ top: 16, right: 16, bottom: 8, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="sede" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="calificacion"
                  name="Calificación NPS"
                  fill="var(--color-info)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 app-table-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="brand-bg text-white">
                <tr>
                  {['SEDE', 'FECHA', 'NPS', 'ENC 0-6', 'ENC 7-8', 'ENC 9-10'].map(
                    (h) => (
                      <th key={h} className="px-3 py-2.5 text-center font-semibold">
                        {h}
                      </th>
                    ),
                  )}
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
                      <td className="px-3 py-2">
                        {d.fecha?.slice?.(0, 10) ?? d.fecha}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        {d.calificacion.toFixed(1)}
                      </td>
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
      ) : null}

      {!loading && applied?.modo === 'tecnico' && tecData ? (
        <div className="grid gap-4 lg:grid-cols-2 min-w-0">
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
                <div className="h-[220px] w-full min-w-0">
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
                          <Cell
                            key={pie[i].name}
                            fill={ENC_COLORS[i % ENC_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 app-table-scroll">
                  <table className="w-full min-w-[640px] text-xs md:text-sm">
                    <thead className="brand-bg text-white">
                      <tr>
                        {['TÉCNICO', 'ENC 0-6', 'ENC 7-8', 'ENC 9-10', 'NPS'].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-2 py-2 text-center font-semibold"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.detalle.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-gray-500"
                          >
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
      ) : null}
    </AuditoriaPageFrame>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="app-section-card w-full min-w-0">
      <h2 className="mb-3 break-words text-base font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  );
}
