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
    <div className="flex h-8 w-full min-w-0 overflow-hidden rounded-md bg-gray-100 sm:h-10">
      <div
        className={`${filledClass} flex items-center justify-center overflow-hidden px-0.5 text-[10px] font-semibold text-white transition-all sm:text-sm`}
        style={{ width: `${filled}%` }}
      >
        {filled > 12 ? formatPct(filled) : ''}
      </div>
      <div
        className="flex items-center justify-center overflow-hidden bg-[var(--color-danger)] px-0.5 text-[10px] font-semibold text-white transition-all sm:text-sm"
        style={{ width: `${rest}%` }}
      >
        {rest > 12 ? formatPct(rest) : ''}
      </div>
    </div>
  );
}

function MetaRow({
  label,
  actual,
  meta,
  actualClass,
  pctFilled,
  pctRest,
  filledClass,
}: {
  label: string;
  actual: number;
  meta: number;
  actualClass: string;
  pctFilled: number;
  pctRest: number;
  filledClass: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-0.5 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:text-sm">
        <span>{label}</span>
        <span className="tabular-nums">
          <span className={`font-medium ${actualClass}`}>{formatMoney(actual)}</span>
          {' / '}
          <span className="font-medium text-[var(--color-danger)]">
            {formatMoney(meta)}
          </span>
        </span>
      </div>
      <DualProgressBar
        pctFilled={pctFilled}
        pctRest={pctRest}
        filledClass={filledClass}
      />
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
    <div className="app-section-card min-w-0">
      <div className="mb-4 text-center">
        <p className="break-all text-2xl font-bold brand-text sm:text-3xl">
          {formatMoney(totalDia)}
        </p>
        <p className="mt-1 text-sm text-gray-500">Total {titulo}</p>
      </div>

      <div className="mb-3">
        <MetaRow
          label="Meta a cumplir a día de hoy"
          actual={totalDia}
          meta={metaHoy}
          actualClass="text-[var(--color-info)]"
          pctFilled={porcentajeHoy}
          pctRest={porcentajeHoyRestante}
          filledClass="bg-[var(--color-info)]"
        />
      </div>

      <div className="mb-3">
        <MetaRow
          label="Meta a cumplir al mes"
          actual={totalDia}
          meta={metaMes}
          actualClass="text-[var(--color-success)]"
          pctFilled={porcentajeMes}
          pctRest={porcentajeMesRestante}
          filledClass="bg-[var(--color-success)]"
        />
      </div>

      {children}

      {footer ? (
        <div className="mt-4 border-t border-gray-100 pt-3">{footer}</div>
      ) : null}
    </div>
  );
}

type BreakdownColumn = { label: string; value: number };

export function BreakdownTable({ columns }: { columns: BreakdownColumn[] }) {
  const minW = columns.length > 3 ? 'min-w-[520px]' : 'min-w-[360px]';
  return (
    <div className="app-table-scroll mt-2">
      <table className={`w-full ${minW} text-center text-xs sm:text-sm`}>
        <thead>
          <tr className="border-b text-gray-600">
            {columns.map((col) => (
              <th key={col.label} className="px-2 py-2 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columns.map((col) => (
              <td key={col.label} className="px-2 py-2 font-medium tabular-nums">
                {formatMoney(col.value)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
