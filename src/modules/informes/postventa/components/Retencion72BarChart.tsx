'use client';

import { memo } from 'react';

export type Retencion72BarPoint = {
  label: string;
  valor: number;
  comparacion?: number;
};

type Props = {
  title: string;
  data: Retencion72BarPoint[];
  labelPrincipal?: string;
  labelComparacion?: string;
};

function maxValue(points: Retencion72BarPoint[]): number {
  if (points.length === 0) return 1;
  const values = points.flatMap((p) =>
    p.comparacion == null ? [p.valor] : [p.valor, p.comparacion],
  );
  const max = Math.max(...values);
  return max > 0 ? max : 1;
}

export const Retencion72BarChart = memo(function Retencion72BarChart({
  title,
  data,
  labelPrincipal = 'Principal',
  labelComparacion = 'Comparación',
}: Props) {
  const max = maxValue(data);
  return (
    <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
      <div className="space-y-3">
        {data.map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{row.label}</span>
              <span>{row.valor.toFixed(1)}%</span>
            </div>
            <div className="h-5 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-5 bg-(--color-primary)"
                style={{ width: `${Math.min(100, (row.valor / max) * 100)}%` }}
                title={`${labelPrincipal}: ${row.valor.toFixed(1)}%`}
              />
            </div>
            {row.comparacion != null && (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{labelComparacion}</span>
                  <span>{row.comparacion.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-3 bg-emerald-500"
                    style={{
                      width: `${Math.min(100, (row.comparacion / max) * 100)}%`,
                    }}
                    title={`${labelComparacion}: ${row.comparacion.toFixed(1)}%`}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500 flex gap-4">
        <span>{labelPrincipal}: barra principal</span>
        <span>{labelComparacion}: barra secundaria</span>
      </div>
    </div>
  );
});

