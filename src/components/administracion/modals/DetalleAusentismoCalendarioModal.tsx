'use client';

import Modal from "@/components/shared/ui/Modal";
import { Calendar, FileText } from "lucide-react";
import type { AusentismoCalendario } from "@/modules/administracion/services/nuevo-ausentismo.service";

interface DetalleAusentismoCalendarioModalProps {
  open: boolean;
  onClose: () => void;
  ausentismo: AusentismoCalendario | null;
}

function getEstadoBadgeClasses(estado: string) {
  if (estado === "Aprobado" || estado === "Autorizado") return "bg-green-100 text-green-700";
  if (estado === "Rechazado") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function DetalleAusentismoCalendarioModal({
  open,
  onClose,
  ausentismo,
}: DetalleAusentismoCalendarioModalProps) {
  if (!ausentismo) return null;

  return (
    <Modal open={open} onClose={onClose} title="Detalle del ausentismo" width="500px">
      <div className="space-y-5 p-1">
        <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold brand-text">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <Calendar size={18} className="text-[var(--color-primary)]" />
            </span>
            Fecha y horario
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Fecha</span>
              <p className="font-medium text-gray-900">{ausentismo.fecha}</p>
            </div>
            <div>
              <span className="text-gray-500">Estado</span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getEstadoBadgeClasses(ausentismo.estado)}`}
              >
                {ausentismo.estado}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Hora inicio</span>
              <p className="font-medium text-gray-900">{ausentismo.horaInicio}</p>
            </div>
            <div>
              <span className="text-gray-500">Hora fin</span>
              <p className="font-medium text-gray-900">{ausentismo.horaFin}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold brand-text">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <FileText size={18} className="text-[var(--color-primary)]" />
            </span>
            Motivo y descripción
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-500">Motivo</span>
              <p className="font-medium text-[var(--color-primary)]">{ausentismo.motivo || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Descripción</span>
              <p className="text-gray-900 leading-relaxed">{ausentismo.descripcion || "—"}</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            type="button"
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
