'use client';

import Modal from "@/components/shared/ui/Modal";
import { User, Calendar, FileText } from "lucide-react";
import { AusentismoInforme } from "@/modules/administracion/services/informe-ausentismo.service";

interface DetalleAusentismoModalProps {
  open: boolean;
  onClose: () => void;
  ausentismo: AusentismoInforme | null;
}

function getEstadoBadgeClasses(estado: string) {
  if (estado === "Autorizado" || estado === "Aprobado") return "bg-green-100 text-green-700";
  if (estado === "Rechazado") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function DetalleAusentismoModal({
  open,
  onClose,
  ausentismo,
}: DetalleAusentismoModalProps) {
  if (!ausentismo) return null;

  return (
    <Modal open={open} onClose={onClose} title="Detalle del Ausentismo" width="600px">
      <div className="space-y-6 p-1">
        <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold brand-text">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <User size={18} className="text-[var(--color-primary)]" />
            </span>
            Datos del colaborador
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Gestionado Por</label>
              <p className="text-gray-900 font-medium">{ausentismo.gestionadoPor}</p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Colaborador</label>
              <p className="text-gray-900 font-medium">{ausentismo.colaborador}</p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Sede</label>
              <p className="text-gray-900">{ausentismo.sede}</p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Área</label>
              <p className="text-gray-900">{ausentismo.area}</p>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Estado</label>
              <span
                className={`inline-block px-3 py-1.5 rounded-lg text-xs font-medium ${getEstadoBadgeClasses(ausentismo.estado)}`}
              >
                {ausentismo.estado}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold brand-text">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <Calendar size={18} className="text-[var(--color-primary)]" />
            </span>
            Fechas y horarios
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Fecha Inicio</label>
              <p className="text-gray-900 font-medium">{ausentismo.fechaInicio}</p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Hora Inicio</label>
              <p className="text-gray-900 font-medium">{ausentismo.horaInicio}</p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Fecha Fin</label>
              <p className="text-gray-900 font-medium">{ausentismo.fechaFin}</p>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Hora Fin</label>
              <p className="text-gray-900 font-medium">{ausentismo.horaFin}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold brand-text">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
              <FileText size={18} className="text-[var(--color-primary)]" />
            </span>
            Detalle
          </h3>
          <p className="text-gray-900 leading-relaxed">{ausentismo.detalle || "—"}</p>
        </section>

        <div className="flex justify-end pt-2 border-t border-gray-100">
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
