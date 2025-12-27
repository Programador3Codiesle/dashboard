'use client';
import Modal from "@/components/shared/ui/Modal";
import { useState, useEffect } from "react";
import { useTicketsActions } from "@/modules/tickets/hooks/useTicketsActions";
import { ticketsService } from "@/modules/tickets/services/tickets.service";
import { User, Monitor, HelpCircle, FileText, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/core/auth/hooks/useAuth";

export default function ResponderTicketModal({
    open,
    onClose,
    ticket
}: {
    open: boolean;
    onClose: () => void;
    ticket: {
        id: number;
        usuario?: string;
        anydesk?: string;
        tipoSoporte?: string;
        descripcion?: string;
        archivoUrl?: string | null;
        respuestasRaw?: string | null;
    } | null;
}) {
    const { user } = useAuth();
    const [mensaje, setMensaje] = useState("");
    const [cerrar, setCerrar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [ticketData, setTicketData] = useState<{
        id: number;
        tipoSoporte: string;
        descripcion: string;
        anydesk: string;
        archivoUrl: string | null;
        respuestas: string;
        usuario: string;
    } | null>(null);
    const { responder } = useTicketsActions();

    // Cargar data completa del ticket cuando se abre el modal
    useEffect(() => {
        if (open && ticket?.id) {
            setLoadingData(true);
            ticketsService.getTicketById(ticket.id)
                .then((data) => {
                    setTicketData({
                        ...data,
                        usuario: ticket.usuario || "Usuario",
                    });
                })
                .catch((err) => {
                    console.error("Error cargando ticket:", err);
                })
                .finally(() => {
                    setLoadingData(false);
                });
        } else if (!open) {
            // Limpiar cuando se cierra
            setTicketData(null);
            setMensaje("");
            setCerrar(false);
        }
    }, [open, ticket?.id, ticket?.usuario]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket || !ticketData) return;

        setLoading(true);
        try {
            // Usar nombre_usuario del usuario autenticado (viene del login)
            const nombre = user?.nombre_usuario || user?.name || "Usuario";
            await responder(ticket.id, mensaje, cerrar, nombre);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm";

    const displayData = ticketData || ticket;

    return (
        <Modal open={open} onClose={onClose} title={`Responder Ticket #${ticket?.id ?? ""}`} width="640px">
            <div className="space-y-5 p-1">
                {loadingData ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-amber-500" size={32} />
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600 col-span-2">
                                <User size={14} className="text-gray-400" />
                                <span className="font-bold text-gray-900">Usuario:</span>
                                <span className="text-gray-900">{displayData?.usuario || "—"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <HelpCircle size={14} className="text-gray-400" />
                                <span className="font-bold text-gray-900">Soporte:</span>
                                <span className="text-gray-900">{displayData?.tipoSoporte || "—"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Monitor size={14} className="text-gray-400" />
                                <span className="font-bold text-gray-900">Anydesk:</span>
                                <span className="text-gray-900">{displayData?.anydesk || "—"}</span>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-gray-200 mt-2">
                            <div className="flex gap-2">
                                <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-gray-900 block mb-1">Descripción:</span>
                                    <p className="text-sm text-gray-900 leading-relaxed">{displayData?.descripcion || "—"}</p>
                                </div>
                            </div>
                        </div>

                        {displayData?.archivoUrl && (
                            <div className="pt-2 border-t border-gray-200 mt-2">
                                <p className="text-sm font-bold text-gray-900 mb-1">Archivo adjunto</p>
                                <a
                                    href={displayData.archivoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-sm text-indigo-600 border border-indigo-100 hover:bg-indigo-50 transition-colors"
                                >
                                    <FileText size={14} />
                                    <span className="truncate max-w-[220px]">{displayData.archivoUrl.split("/").pop()}</span>
                                </a>
                            </div>
                        )}

                        {ticketData?.respuestas && (
                            <div className="pt-3 border-t border-gray-200 mt-2 space-y-2">
                                <p className="text-xs font-semibold text-gray-500">Historial de respuestas</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {ticketData.respuestas
                                        .split(",")
                                        .map((chunk) => chunk.trim())
                                        .filter(Boolean)
                                        .map((entry, idx) => {
                                            const [autor, ...rest] = entry.split(":");
                                            const mensaje = rest.join(":").trim();
                                            return (
                                                <div
                                                    key={`${autor}-${idx}`}
                                                    className="flex items-start gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100"
                                                >
                                                    <MessageCircle size={14} className="text-gray-400 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-700">{autor}</p>
                                                        <p className="text-xs text-gray-600">{mensaje}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta</label>
                        <textarea
                            className={inputClass}
                            rows={5}
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            placeholder="Escribe tu respuesta para el usuario..."
                            autoFocus
                        />
                    </div>

                    <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors w-fit">
                        <input
                            type="checkbox"
                            checked={cerrar}
                            onChange={(e) => setCerrar(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Marcar ticket como resuelto y cerrar</span>
                    </label>

                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !mensaje}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Enviando..." : "Responder"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
