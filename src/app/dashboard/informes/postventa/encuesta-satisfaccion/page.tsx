'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { encuestaSatisfaccionService, EncuestaSatisfaccionResumen } from '@/modules/informes/postventa/services/encuesta-satisfaccion.service';
import { SelectSede } from '@/shared/components/selects/select-sede';
import { useToast } from '@/components/shared/ui/ToastContext';
import { formatNumeroCo } from '@/modules/informes/postventa/format-cantidad-co';

type NivelSatisfaccion = 0 | 10 | 8 | 7 | 6;

const inputClass =
  'w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-(--color-primary) focus:border-(--color-primary) outline-none bg-white';
const labelClass = 'text-xs font-medium text-gray-600 mb-1';

export default function EncuestaSatisfaccionPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [bodega, setBodega] = useState<string>('todas');
  const [tecnico, setTecnico] = useState<string>('all');
  const [cliente, setCliente] = useState<string>('');
  const [orden, setOrden] = useState<string>('');
  const [nivel, setNivel] = useState<NivelSatisfaccion>(0);
  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    fi: string;
    ff: string;
    bode: string;
    tec: string;
    cli?: string;
    ot?: string;
    ns: NivelSatisfaccion;
  } | null>(null);

  const { showError, showSuccess, showInfo } = useToast();

  const {
    data,
    isFetching,
    isError,
  } = useQuery<EncuestaSatisfaccionResumen[]>({
    queryKey: ['informes', 'postventa', 'encuesta-satisfaccion', filtrosAplicados],
    queryFn: () => encuestaSatisfaccionService.listar(filtrosAplicados!),
    enabled: filtrosAplicados != null,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!isError) return;
    showError('No se pudo cargar el informe de encuestas.');
  }, [isError, showError]);

  useEffect(() => {
    if (filtrosAplicados == null || isFetching || !data) return;
    if (data.length === 0) {
      showInfo('No hay datos para los filtros seleccionados.');
    } else {
      showSuccess('Informe de encuestas cargado correctamente.');
    }
  }, [filtrosAplicados, isFetching, data, showInfo, showSuccess]);

  const getColorClase = (valor: number) => {
    if (valor > 8 && valor <= 10) return 'bg-emerald-500 text-white';
    if (valor >= 7 && valor <= 8) return 'bg-amber-400 text-gray-900';
    return 'bg-red-500 text-white';
  };

  const handleBuscar = () => {
    if (isFetching) return;
    if (!dateRange?.from || !dateRange?.to) {
      showInfo('Selecciona un rango de fechas.');
      return;
    }
    const fi = dateRange.from.toISOString().slice(0, 10);
    const ff = dateRange.to.toISOString().slice(0, 10);
    setFiltrosAplicados({
      fi,
      ff,
      bode: bodega,
      tec: tecnico,
      cli: cliente || undefined,
      ot: orden || undefined,
      ns: nivel || 0,
    });
  };

  const dateInputValue = (date?: Date) => (date ? date.toISOString().slice(0, 10) : '');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold brand-text">Encuesta de Satisfacción</h1>
          <p className="text-gray-500 text-sm mt-1">
            Resumen de satisfacción de clientes por asesor/técnico según encuestas registradas.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className={labelClass}>Fecha inicial</label>
            <input
              type="date"
              value={dateInputValue(dateRange?.from)}
              onChange={(e) => {
                const from = e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined;
                setDateRange((prev) => ({ from, to: prev?.to }));
              }}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Fecha final</label>
            <input
              type="date"
              value={dateInputValue(dateRange?.to)}
              onChange={(e) => {
                const to = e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined;
                setDateRange((prev) => ({ from: prev?.from, to }));
              }}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Bodega</label>
            <SelectSede
              value={bodega}
              onChange={setBodega}
              includeTodas
              className={inputClass}
            />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Nivel de satisfacción (NPS)</label>
            <select
              value={nivel}
              onChange={(e) => setNivel(Number(e.target.value) as NivelSatisfaccion)}
              className={inputClass}
            >
              <option value={0}>Todos</option>
              <option value={10}>10</option>
              <option value={8}>8 - 9</option>
              <option value={7}>6 - 8</option>
              <option value={6}>0 - 5</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className={labelClass}>Cliente (NIT)</label>
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className={inputClass}
              placeholder="Opcional"
            />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Número de orden</label>
            <input
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className={inputClass}
              placeholder="Opcional"
            />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Técnico / Asesor</label>
            <input
              value={tecnico}
              onChange={(e) => setTecnico(e.target.value)}
              className={inputClass}
              placeholder="Por ahora escribe el NIT (legacy usa combo dinámico)"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-end">
          <button
            type="button"
            onClick={handleBuscar}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-sm font-medium shadow-sm hover:bg-(--color-primary-dark) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isFetching ? 'Cargando...' : 'Buscar'}
          </button>
          {(data?.length ?? 0) > 0 && (
            <span className="text-xs text-gray-500">
              {data?.length} registro{(data?.length ?? 0) === 1 ? '' : 's'} encontrados
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.map((row) => {
          const colorP1 = getColorClase(row.promP1);
          const colorP2 = getColorClase(row.promP2);

          return (
            <div
              key={row.vendedor}
              className="bg-white rounded-xl border brand-border shadow-sm overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">
                  {row.nombres}
                </h3>
                <p className="text-xs text-gray-500">NIT: {row.vendedor}</p>
              </div>
              <div className="p-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`rounded-lg p-3 text-center ${colorP1}`}>
                    <p className="text-[11px] font-semibold mb-1">
                      Satisfacción con el concesionario
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatNumeroCo(row.promP1, 2, 2)}
                    </p>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${colorP2}`}>
                    <p className="text-[11px] font-semibold mb-1">
                      Satisfacción con el trabajo realizado
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatNumeroCo(row.promP2, 2, 2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 border-t bg-gray-50 flex justify-center">
                <a
                  href={`https://intranet.codiesel.co/postventa/encuesta/detalle_encuesta_satisfaccion_v?nit=${row.vendedor}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-md bg-gray-200 text-xs font-medium text-gray-800 hover:bg-gray-300"
                >
                  Ver más información (legacy)
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

