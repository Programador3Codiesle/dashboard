import { memo } from 'react';

/** Paridad visual con legacy: bloque “camiones” con 85% fijo sin datos reales. */
export const PanelNpsCamionesPlaceholder = memo(
  function PanelNpsCamionesPlaceholder() {
    return (
      <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
        <h3 className="text-xs font-semibold text-gray-600 mb-2">
          NPS camiones (placeholder)
        </h3>
        <p className="text-[11px] text-gray-500 mb-2">
          El panel legacy muestra un valor fijo del 85% sin consulta a base de
          datos. Aquí se mantiene la misma referencia visual.
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center text-[11px]">
              <div className="px-2 py-1 rounded-full font-semibold min-w-[52px] bg-emerald-500 text-white">
                85,0%
              </div>
              <span className="mt-1 text-gray-400">—</span>
            </div>
          ))}
        </div>
      </div>
    );
  },
);
