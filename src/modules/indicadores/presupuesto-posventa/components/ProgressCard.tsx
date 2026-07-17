'use client';

import type { ReactNode } from 'react';

export function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString('es-CO')}`;
}

export function formatPct(value: number): string {
  return `${Math.round(value)}%`;
}

export function DualProgressBar({
  pctFilled,
  pctRest,
  filledClass,
}: {
  pctFilled: number;
  pctRest: number;
  filledClass: string;
}) {
  const filled = Math.max(0, Math.min(100, pctFilled));
  const rest = Math.max(0, Math.min(100, pctRest));
  return (
    <div className="flex h-10 w-full overflow-hidden rounded-md bg-gray-100">
      <div
        className={`${filledClass} flex items-center justify-center text-sm font-semibold text-white transition-all`}
        style={{ width: `${filled}%` }}
      >
        {filled > 8 ? formatPct(filled) : ''}
      </div>
      <div
        className="flex items-center justify-center bg-red-500 text-sm font-semibold text-white transition-all"
        style={{ width: `${rest}%` }}
      >
        {rest > 8 ? formatPct(rest) : ''}
      </div>
    </div>
  );
}

type ProgressCardProps = {
  titulo: string;
  totalDia: number;
  metaHoy: number;
  metaMes: number;
  porcentajeHoy: number;
  porcentajeHoyRestante: number;
  porcentajeMes: number;
  porcentajeMesRestante: number;
  footer?: ReactNode;
  children?: ReactNode;
};

export function ProgressCard({
  titulo,
  totalDia,
  metaHoy,
  metaMes,
  porcentajeHoy,
  porcentajeHoyRestante,
  porcentajeMes,
  porcentajeMesRestante,
  footer,
  children,
}: ProgressCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 text-center">
        <p className="text-2xl font-bold brand-text sm:text-3xl">
          {formatMoney(totalDia)}
        </p>
        <p className="mt-1 text-sm text-gray-500">Total {titulo}</p>
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-600 sm:text-sm">
          <span>Meta a cumplir a día de hoy</span>
          <span>
            <span className="font-medium text-sky-600">
              {formatMoney(totalDia)}
            </span>
            {' / '}
            <span className="font-medium text-red-600">
              {formatMoney(metaHoy)}
            </span>
          </span>
        </div>
        <DualProgressBar
          pctFilled={porcentajeHoy}
          pctRest={porcentajeHoyRestante}
          filledClass="bg-sky-500"
        />
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-600 sm:text-sm">
          <span>Meta a cumplir al mes</span>
          <span>
            <span className="font-medium text-emerald-600">
              {formatMoney(totalDia)}
            </span>
            {' / '}
            <span className="font-medium text-red-600">
              {formatMoney(metaMes)}
            </span>
          </span>
        </div>
        <DualProgressBar
          pctFilled={porcentajeMes}
          pctRest={porcentajeMesRestante}
          filledClass="bg-emerald-500"
        />
      </div>

      {children}

      {footer ? <div className="mt-4 border-t border-gray-100 pt-3">{footer}</div> : null}
    </div>
  );
}
