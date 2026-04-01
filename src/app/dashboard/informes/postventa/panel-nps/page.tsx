'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  PanelNpsResponse,
  PanelNpsDetalle,
  PanelNpsTablaRow,
  SedeSerieNps,
  panelNpsService,
} from '@/modules/informes/postventa/services/panel-nps.service';
import { useToast } from '@/components/shared/ui/ToastContext';

function nombreMes(mesNumero: number) {
  const nombres = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ];
  if (mesNumero < 1 || mesNumero > 12) return `${mesNumero}`;
  return nombres[mesNumero - 1];
}

function getColorBadge(nps: number) {
  if (nps >= 80) return 'bg-emerald-500';
  return 'bg-red-500';
}

export default function PanelNpsPage() {
  const [data, setData] = useState<PanelNpsResponse | null>(null);
   const [detalle, setDetalle] = useState<PanelNpsDetalle | null>(null);
   const [detalleVisible, setDetalleVisible] = useState(false);
  const { showError, showInfo } = useToast();

  const { mutate, status } = useMutation<PanelNpsResponse, Error, void>({
    mutationFn: async () => {
      const resp = await panelNpsService.obtenerPanel();
      if (!resp.series.length) {
        showInfo('No hay datos para mostrar en el panel NPS.');
      }
      setData(resp);
      return resp;
    },
    onError: () => {
      showError('No se pudo cargar el panel de gestión NPS.');
    },
  });

  useEffect(() => {
    mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const series: SedeSerieNps[] = data?.series ?? [];
  const tabla: PanelNpsTablaRow[] = data?.tabla ?? [];

  const mesMasRecienteGeneral = useMemo(() => {
    const generalSerie = series.find((s) => s.sede === 'general');
    if (!generalSerie || generalSerie.puntos.length === 0) return null;
    return generalSerie.puntos[generalSerie.puntos.length - 1].mes;
  }, [series]);

  const handleVerDetalleGeneral = async (mes: number) => {
    try {
      const resp = await panelNpsService.obtenerDetalleGeneral({ mes });
      if (!resp) {
        showInfo('No hay detalle para el mes seleccionado.');
        return;
      }
      setDetalle(resp);
      setDetalleVisible(true);
    } catch {
      showError('No se pudo cargar el detalle general.');
    }
  };

  const handleVerDetalleSede = async (sede: string, mes: number) => {
    try {
      const resp = await panelNpsService.obtenerDetalleSede({ sede, mes });
      if (!resp) {
        showInfo('No hay detalle para la sede y mes seleccionados.');
        return;
      }
      setDetalle(resp);
      setDetalleVisible(true);
    } catch {
      showError('No se pudo cargar el detalle por sede.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">
            Panel Gestión NPS
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Visualiza la evolución del NPS general y por sede en los últimos 6
            meses y su resumen actual.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              NPS últimos 6 meses por sede
            </h2>
            <div className="space-y-3">
              {series.map((serie) => (
                <div key={serie.sede} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold capitalize">
                      {serie.sede}
                    </span>
                    {serie.puntos.length > 0 && (
                      <span className="text-gray-500">
                        Mes más reciente:{' '}
                        {nombreMes(
                          serie.puntos[serie.puntos.length - 1].mes ?? 0,
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {serie.puntos.map((punto) => (
                      <div
                        key={`${serie.sede}-${punto.mes}`}
                          className="flex flex-col items-center text-[11px]"
                      >
                        <div
                          className={`px-2 py-1 rounded-full text-white font-semibold ${getColorBadge(
                            punto.nps,
                          )}`}
                        >
                          {punto.nps.toFixed(1)}%
                        </div>
                        <span className="mt-1 text-gray-500">
                          {nombreMes(punto.mes)}
                        </span>
                      </div>
                    ))}
                    {!serie.puntos.length && (
                      <span className="text-xs text-gray-400">
                        Sin datos recientes.
                      </span>
                    )}
                  </div>
                  {serie.puntos.length > 0 && (
                    <button
                      type="button"
                      className="mt-1 text-[11px] text-[--color-primary] hover:underline"
                      onClick={() =>
                        handleVerDetalleSede(
                          serie.sede,
                          serie.puntos[serie.puntos.length - 1].mes,
                        )
                      }
                    >
                      Ver detalle último mes
                    </button>
                  )}
                </div>
              ))}
              {status !== 'pending' && series.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  No hay datos de NPS para mostrar.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border brand-border p-4 md:p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Resumen NPS actual
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border-collapse">
                <thead>
                  <tr className="text-center text-[11px]">
                    <th className="px-1 py-1 bg-red-500 text-white w-10">
                      D
                    </th>
                    <th className="px-1 py-1 bg-yellow-300 text-black w-10">
                      N
                    </th>
                    <th className="px-1 py-1 bg-green-500 text-black w-10">
                      P
                    </th>
                    <th className="px-1 py-1 bg-cyan-300 text-black w-10">
                      PA
                    </th>
                    <th className="px-1 py-1 bg-slate-200 text-black w-14">
                      NPS
                    </th>
                    <th className="px-1 py-1 bg-slate-200 text-black w-16">
                      META NPS
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {tabla.map((row) => (
                    <tr key={row.sede} className="border-t">
                      <td className="px-1 py-1 bg-red-500 text-white">
                        {row.enc0a6}
                      </td>
                      <td className="px-1 py-1 bg-yellow-300 text-black">
                        {row.enc7a8}
                      </td>
                      <td className="px-1 py-1 bg-green-500 text-black">
                        {row.enc9a10}
                      </td>
                      <td className="px-1 py-1 bg-cyan-300 text-black">
                        {row.to.toFixed(0)}
                      </td>
                      <td className="px-1 py-1 bg-slate-200 text-black">
                        {row.nps.toFixed(1)}%
                      </td>
                      <td className="px-1 py-1 bg-slate-200 text-black">
                        {row.meta.toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                  {status !== 'pending' && tabla.length === 0 && (
                    <tr>
                      <td
                        className="px-2 py-2 text-gray-400 text-xs"
                        colSpan={6}
                      >
                        Sin datos para el mes actual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {mesMasRecienteGeneral && (
              <div className="mt-3 text-right">
                <button
                  type="button"
                  className="text-[11px] text-[--color-primary] hover:underline"
                  onClick={() => handleVerDetalleGeneral(mesMasRecienteGeneral)}
                >
                  Ver detalle general último mes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {detalleVisible && detalle && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Detalle {detalle.scope === 'general'
                  ? 'NPS general'
                  : detalle.scope === 'sede'
                  ? 'NPS por sede'
                  : 'NPS por técnico'}
              </h2>
              <button
                type="button"
                onClick={() => setDetalleVisible(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <span className="font-semibold">
                  {detalle.scope === 'tecnico' ? 'Técnico: ' : 'Sede: '}
                </span>
                <span>{detalle.titulo}</span>
              </div>
              <div>
                <span className="font-semibold">Mes: </span>
                <span>{detalle.mesNombre}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-red-500 text-white rounded-lg py-2 px-1">
                <div className="text-lg font-bold">{detalle.enc0a6}</div>
                <div className="mt-1">Encuestas 0 - 6</div>
              </div>
              <div className="bg-yellow-300 text-black rounded-lg py-2 px-1">
                <div className="text-lg font-bold">{detalle.enc7a8}</div>
                <div className="mt-1">Encuestas 7 - 8</div>
              </div>
              <div className="bg-green-500 text-black rounded-lg py-2 px-1">
                <div className="text-lg font-bold">{detalle.enc9a10}</div>
                <div className="mt-1">Encuestas 9 - 10</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

