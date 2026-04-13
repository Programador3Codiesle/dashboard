import { memo } from 'react';
import type { PanelNpsDetalle } from '@/modules/informes/postventa/services/panel-nps.service';

export type PanelNpsDetalleModalProps = {
  open: boolean;
  detalle: PanelNpsDetalle | null;
  isLoading: boolean;
  onClose: () => void;
};

export const PanelNpsDetalleModal = memo(function PanelNpsDetalleModal({
  open,
  detalle,
  isLoading,
  onClose,
}: PanelNpsDetalleModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            {isLoading
              ? 'Cargando detalle…'
              : detalle
                ? detalle.scope === 'general'
                  ? 'Detalle NPS general'
                  : detalle.scope === 'sede'
                    ? 'Detalle NPS por sede'
                    : 'Detalle NPS por técnico'
                : 'Detalle NPS'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {isLoading && (
          <p className="text-xs text-gray-500">Obteniendo datos del servidor…</p>
        )}
        {!isLoading && !detalle && (
          <p className="text-xs text-gray-500">No hay detalle para la selección.</p>
        )}
        {!isLoading && detalle && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
});
