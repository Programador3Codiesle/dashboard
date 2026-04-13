import { memo } from 'react';
import { badgeClassNpsNullable, nombreMes } from '../panel-nps-utils';

export type PanelNpsMesCeldasProps = {
  cells: { mes: number; nps: number | null }[];
  /** Si es false, las celdas sin NPS no abren detalle (matriz técnico, paridad legacy). */
  allowClickWhenNull?: boolean;
  onMonthClick: (mes: number) => void;
};

export const PanelNpsMesCeldas = memo(function PanelNpsMesCeldas({
  cells,
  allowClickWhenNull = true,
  onMonthClick,
}: PanelNpsMesCeldasProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {cells.map(({ mes, nps }, idx) => {
        const disabled = !allowClickWhenNull && nps === null;
        const label = nps === null ? '—' : `${nps.toFixed(1)}%`;
        const cls = badgeClassNpsNullable(nps);
        return (
          <button
            key={`${mes}-${idx}`}
            type="button"
            disabled={disabled}
            className={`flex flex-col items-center text-[11px] ${
              disabled
                ? 'opacity-70 cursor-not-allowed'
                : 'cursor-pointer hover:opacity-90'
            }`}
            onClick={() => {
              if (!disabled) onMonthClick(mes);
            }}
          >
            <div
              className={`px-2 py-1 rounded-full font-semibold min-w-[52px] ${cls}`}
            >
              {label}
            </div>
            <span className="mt-1 text-gray-500">{nombreMes(mes)}</span>
          </button>
        );
      })}
    </div>
  );
});
