'use client';

import Modal from "@/components/shared/ui/Modal";
import { Ausentismo } from "@/modules/administracion/types";

interface DetalleAusentismoModalProps {
  open: boolean;
  onClose: () => void;
  ausentismo: Ausentismo | null;
}

export default function DetalleAusentismoModal({
  open,
  onClose,
  ausentismo,
}: DetalleAusentismoModalProps) {
  if (!ausentismo) return null;

  return (
    <Modal open={open} onClose={onClose} title="Detalle del Ausentismo" width="600px">
      <div className="space-y-4 p-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gestionado Por</label>
            <p className="text-gray-900 font-medium">{ausentismo.gestionadoPor}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Colaborador</label>
            <p className="text-gray-900 font-medium">{ausentismo.colaborador}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
            <p className="text-gray-900">{ausentismo.sede}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
            <p className="text-gray-900">{ausentismo.area}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <p className="text-gray-900">{ausentismo.cargo || "N/A"}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              ausentismo.estado === "Aprobado" 
                ? "bg-green-100 text-green-700" 
                : "bg-yellow-100 text-yellow-700"
            }`}>
              {ausentismo.estado}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <p className="text-gray-900">{ausentismo.fechaInicio}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
            <p className="text-gray-900">{ausentismo.horaInicio}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <p className="text-gray-900">{ausentismo.fechaFin}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
            <p className="text-gray-900">{ausentismo.horaFin}</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
          <p className="text-gray-900">{ausentismo.motivo || "N/A"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Detalle</label>
          <p className="text-gray-900">{ausentismo.detalle}</p>
        </div>
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

