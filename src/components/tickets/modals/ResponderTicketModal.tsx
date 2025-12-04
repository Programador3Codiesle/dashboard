'use client';
import Modal from "@/components/shared/ui/Modal";
import { useState } from "react";
import { useTicketsActions } from "@/modules/tickets/hooks/useTicketsActions";
import { User, Monitor, HelpCircle, FileText } from "lucide-react";

export default function ResponderTicketModal({
    open,
    onClose,
    ticket
}: {
    open: boolean;
    onClose: () => void;
    ticket: { id: number; usuario: string; anydesk?: string; tipoSoporte?: string; descripcion?: string } | null;
}) {
    const [mensaje, setMensaje] = useState("");
    const [cerrar, setCerrar] = useState(false);
    const [loading, setLoading] = useState(false);
    const { responder } = useTicketsActions();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticket) return;
        setLoading(true);
        await responder(ticket.id, mensaje, cerrar);
        setLoading(false);
        onClose();
    };

    const inputClass = "w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm";

    return (
        <Modal open={open} onClose={onClose} title={`Responder Ticket #${ticket?.id ?? ""}`} width="640px">
            <div className="space-y-5 p-1">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-900">{ticket?.usuario}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Monitor size={14} className="text-gray-400" />
                            <span>Anydesk: {ticket?.anydesk || "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                            <HelpCircle size={14} className="text-gray-400" />
                            <span>Soporte: {ticket?.tipoSoporte || "—"}</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200 mt-2">
                        <div className="flex gap-2">
                            <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-gray-700 leading-relaxed">{ticket?.descripcion}</p>
                        </div>
                    </div>
                </div>

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
