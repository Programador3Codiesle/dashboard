import { memo, useCallback } from 'react';
import type { PacNpsEncuestaTecnico } from '@/modules/informes/postventa/services/pac-nps-interno-detallado.service';
import { formatCantidadCo } from '@/modules/informes/postventa/format-cantidad-co';

const BODEGA_SIN_DRILL = 22;

function npsCardClassP1(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return 'bg-slate-500';
  if (value >= 9) return 'bg-emerald-600';
  if (value === 8 || value === 7) return 'bg-amber-500';
  return 'bg-red-600';
}

function siNoClass(v: string | null | undefined): string {
  if (!v) return 'bg-slate-500';
  const u = v.toUpperCase();
  if (u === 'SI') return 'bg-emerald-600';
  if (u === 'NO') return 'bg-red-600';
  return 'bg-slate-500';
}

export const PacNpsBodegaCell = memo(function PacNpsBodegaCell({
  bodega,
  descripcion,
  ordenesFinalizadas,
  encuestas,
  nps,
  onSelect,
}: {
  bodega: number;
  descripcion: string;
  ordenesFinalizadas: number;
  encuestas: number;
  nps: string;
  onSelect: (bodega: number, descripcion: string) => void;
}) {
  const clickable = bodega !== BODEGA_SIN_DRILL;
  const handleClick = useCallback(() => {
    if (clickable) onSelect(bodega, descripcion);
  }, [clickable, onSelect, bodega, descripcion]);

  return (
    <td
      className={`border border-gray-200 p-3 text-center text-xs align-middle min-w-[140px] ${
        clickable
          ? 'cursor-pointer hover:bg-emerald-50 transition-colors'
          : 'opacity-70 cursor-not-allowed'
      }`}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
    >
      <div className="font-semibold text-gray-800">{descripcion}</div>
      <div className="mt-2 space-y-1 text-gray-700">
        <div>
          Órdenes finalizadas: <strong>{ordenesFinalizadas}</strong>
        </div>
        <div>
          Encuestas: <strong>{encuestas}</strong>
        </div>
        <div>
          NPS: <strong>{nps}%</strong>
        </div>
      </div>
    </td>
  );
});

export const PacNpsTecnicoRow = memo(function PacNpsTecnicoRow({
  tecnico,
  ordenes,
  encuestas,
  onVer,
}: {
  tecnico: string;
  ordenes: number;
  encuestas: number;
  onVer: (nombre: string) => void;
}) {
  const handleVer = useCallback(() => {
    onVer(tecnico);
  }, [onVer, tecnico]);

  return (
    <tr className="border-b border-gray-100 text-center text-sm">
      <td className="py-2 px-2">{tecnico}</td>
      <td className="py-2 px-2">{formatCantidadCo(ordenes)}</td>
      <td className="py-2 px-2">{formatCantidadCo(encuestas)}</td>
      <td className="py-2 px-2">
        <button
          type="button"
          onClick={handleVer}
          className="rounded-md bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-1"
        >
          Ver
        </button>
      </td>
    </tr>
  );
});

export const PacNpsEncuestaDetalleBlock = memo(function PacNpsEncuestaDetalleBlock({
  item,
}: {
  item: PacNpsEncuestaTecnico;
}) {
  return (
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-0">
      <div className="flex flex-wrap gap-4 text-base mb-4">
        <div>
          <strong>Cliente: {item.nombres ?? '—'}</strong>
        </div>
        <div>Número de orden: {item.numero}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className={`rounded-lg text-white p-4 text-center ${npsCardClassP1(
            item.pregunta1,
          )}`}
        >
          <div className="text-xs font-medium mb-2 opacity-90">
            Satisfacción con el concesionario (Mantenimiento Reparación)
          </div>
          <div className="text-4xl font-bold">{item.pregunta1 ?? '—'}</div>
        </div>
        <div
          className={`rounded-lg text-white p-4 text-center ${siNoClass(
            item.pregunta3,
          )}`}
        >
          <div className="text-xs font-medium mb-2 opacity-90">
            Explicación todo el trabajo realizado
          </div>
          <div className="text-2xl font-bold">{item.pregunta3 ?? '—'}</div>
        </div>
        <div
          className={`rounded-lg text-white p-4 text-center ${siNoClass(
            item.pregunta4,
          )}`}
        >
          <div className="text-xs font-medium mb-2 opacity-90">
            Se cumplieron los compromisos pactados (Tiempo / proceso)
          </div>
          <div className="text-2xl font-bold">{item.pregunta4 ?? '—'}</div>
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-blue-600 text-white p-4 text-center">
        <div className="text-xs font-medium mb-2 opacity-90">
          Para nosotros es importante conocer tu opinión
        </div>
        <div className="text-xl font-semibold whitespace-pre-wrap">
          {item.pregunta5 ?? '—'}
        </div>
      </div>
    </div>
  );
});

export { BODEGA_SIN_DRILL };
