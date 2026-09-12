"use client";

import type { ReactNode } from "react";
import Modal from "@/components/shared/ui/Modal";
import {
  Building2,
  Calendar,
  FileText,
  HelpCircle,
  Loader2,
  MessageCircle,
  Monitor,
  Phone,
  User,
  UserCog,
} from "lucide-react";
import { resolveTicketPublicFileUrl } from "@/config/public-env";
import { useTicketDetail } from "@/modules/tickets/hooks/useTicketDetail";
import { ITicket } from "@/modules/tickets/types";
import {
  splitRespuestasTicket,
  ticketAdjuntoKind,
} from "@/modules/tickets/utils/ticket-detalle";

function estadoLabel(estado: string | undefined): string {
  const v = (estado || "").toLowerCase();
  if (v === "en proceso") return "En Proceso";
  if (v === "cerrado") return "Cerrado";
  if (v === "activo") return "Activo";
  if (v === "abierto") return "Abierto";
  return estado || "—";
}

function formatFecha(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-CO");
}

export default function VerTicketModal({
  open,
  onClose,
  ticket,
}: {
  open: boolean;
  onClose: () => void;
  ticket: ITicket | null;
}) {
  const { ticketData, loading, error } = useTicketDetail(
    ticket?.id ?? null,
    open && !!ticket?.id,
  );

  const display = {
    usuario: ticketData?.usuario || ticket?.usuario || "—",
    encargado: ticketData?.encargado || ticket?.encargado || null,
    tipoSoporte: ticketData?.tipoSoporte || ticket?.tipoSoporte || "—",
    anydesk: ticketData?.anydesk || ticket?.anydesk || "",
    sede: ticketData?.sede || ticket?.sede || "",
    extension: ticketData?.extension || ticket?.extension || "",
    descripcion: ticketData?.descripcion || ticket?.descripcion || "",
    archivoUrl: ticketData?.archivoUrl ?? ticket?.archivoUrl ?? null,
    fechaCreacion: ticketData?.fechaCreacion || ticket?.fechaCreacion,
    estado: ticketData?.estado || ticket?.estado,
    prioridad: ticketData?.prioridad || ticket?.prioridad || "",
    respuestas: ticketData?.respuestas || "",
  };

  const archivoHref = display.archivoUrl
    ? resolveTicketPublicFileUrl(display.archivoUrl)
    : null;
  const adjuntoKind = archivoHref
    ? ticketAdjuntoKind(display.archivoUrl || archivoHref)
    : "file";
  const respuestas = splitRespuestasTicket(display.respuestas);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Ticket #${ticket?.id ?? ""}`}
      width="720px"
    >
      <div data-testid="tickets-ver-modal" className="space-y-4 p-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin brand-text" size={32} />
          </div>
        ) : error && !ticketData ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Campo
                icon={<User size={14} className="text-gray-400" />}
                label="Usuario"
                value={display.usuario}
              />
              <Campo
                icon={<UserCog size={14} className="text-gray-400" />}
                label="Encargado"
                value={display.encargado || "Sin asignar"}
              />
              <Campo
                icon={<HelpCircle size={14} className="text-gray-400" />}
                label="Soporte"
                value={display.tipoSoporte}
              />
              <Campo
                icon={<Monitor size={14} className="text-gray-400" />}
                label="Anydesk"
                value={display.anydesk || "—"}
              />
              <Campo
                icon={<Building2 size={14} className="text-gray-400" />}
                label="Sede"
                value={display.sede || "—"}
              />
              <Campo
                icon={<Phone size={14} className="text-gray-400" />}
                label="Extensión"
                value={display.extension || "—"}
              />
              <Campo
                icon={<Calendar size={14} className="text-gray-400" />}
                label="Fecha"
                value={formatFecha(display.fechaCreacion)}
              />
              <Campo
                icon={<FileText size={14} className="text-gray-400" />}
                label="Estado"
                value={`${estadoLabel(display.estado)} · ${display.prioridad || "—"}`}
              />
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="flex gap-2">
                <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-gray-900 block mb-1">
                    Descripción
                  </span>
                  <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {display.descripcion || "—"}
                  </p>
                </div>
              </div>
            </div>

            {display.archivoUrl && archivoHref ? (
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <p className="text-sm font-bold text-gray-900">Adjuntos</p>
                <a
                  href={archivoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-sm brand-text border brand-border hover:brand-bg-light transition-colors"
                >
                  <FileText size={14} />
                  <span className="truncate max-w-[min(280px,calc(100vw-8rem))]">
                    {display.archivoUrl.split("/").pop()}
                  </span>
                </a>
                {adjuntoKind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={archivoHref}
                    alt="Adjunto del ticket"
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : adjuntoKind === "pdf" ? (
                  <iframe
                    title="Adjunto PDF"
                    src={archivoHref}
                    className="w-full h-[360px] rounded-lg border border-gray-200 bg-white"
                  />
                ) : null}
              </div>
            ) : null}

            <div className="pt-2 border-t border-gray-200 space-y-2">
              <p className="text-sm font-bold text-gray-900">Respuestas</p>
              {respuestas.length === 0 ? (
                <p className="text-sm text-gray-500">Sin respuestas.</p>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {respuestas.map((entry, idx) => {
                    const [autor, ...rest] = entry.split(":");
                    const texto = rest.join(":").trim();
                    return (
                      <div
                        key={`${autor}-${idx}`}
                        className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100"
                      >
                        <MessageCircle
                          size={14}
                          className="text-gray-400 mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-700">
                            {texto ? autor : "Respuesta"}
                          </p>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {texto || entry}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Campo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm text-gray-600">
      {icon}
      <span className="font-bold text-gray-900 shrink-0">{label}:</span>
      <span className="text-gray-900 break-words">{value}</span>
    </div>
  );
}
