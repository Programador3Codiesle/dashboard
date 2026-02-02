'use client';

import Modal from "@/components/shared/ui/Modal";
import { SolicitudCompra } from "@/modules/administracion/services/gestion-compras.service";

interface VerSolicitudCompraModalProps {
  open: boolean;
  onClose: () => void;
  solicitud: SolicitudCompra | null;
}

export default function VerSolicitudCompraModal({
  open,
  onClose,
  solicitud,
}: VerSolicitudCompraModalProps) {
  if (!solicitud) return null;

  return (
    <Modal open={open} onClose={onClose} title="Detalle de Solicitud">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área que solicita la compra
            </label>
            <input
              type="text"
              value={solicitud.areaSolicita}
              disabled
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sede
            </label>
            <input
              type="text"
              value={solicitud.sede}
              disabled
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Persona que realiza la solicitud
            </label>
            <input
              type="text"
              value={solicitud.usuarioSolicita}
              disabled
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <input
              type="text"
              value={solicitud.cargo || "-"}
              disabled
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gerente que autoriza
            </label>
            <input
              type="text"
              value={solicitud.gerenteAutoriza}
              disabled
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedores sugeridos
            </label>
            <input
              type="text"
              value={solicitud.proveedoresSugeridos || "-"}
              disabled
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de urgencia
            </label>
            <input
              type="text"
              value={`Urgencia ${solicitud.urgencia}`}
              disabled
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha tentativa
            </label>
            <input
              type="text"
              value={solicitud.fechaSolicitud}
              disabled
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Área y % a la que se debe cargar la compra
          </label>
          <textarea
            value={solicitud.areaCarga || "-"}
            disabled
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción de producto o servicio
          </label>
          <textarea
            value={solicitud.descripcion}
            disabled
            rows={4}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm bg-gray-50 resize-none"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
