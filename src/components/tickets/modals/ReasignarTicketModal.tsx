'use client';
import Modal from "@/components/shared/ui/Modal";
import { useState } from "react";
import { useTicketsActions } from "@/modules/tickets/hooks/useTicketsActions";

export default function ReasignarTicketModal({
    open,
    onClose,
    ticketId,
    currentEncargado
}: {
    open: boolean;
    onClose: () => void;
    ticketId: number | null;
    currentEncargado?: string | null;
}) {
    const [encargado, setEncargado] = useState(currentEncargado || "");
    const [loading, setLoading] = useState(false);
    const { reasignar } = useTicketsActions();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketId || !encargado) return;
        setLoading(true);
        await reasignar(ticketId, encargado);
        setLoading(false);
        onClose();
    };

    const inputClass = "mt-1 block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <Modal open={open} onClose={onClose} title="Reasignar ticket" width="420px">
            <form onSubmit={submit} className="space-y-5 p-1">
                <div>
                    <label className={labelClass}>Nuevo encargado</label>
                    <input
                        className={inputClass}
                        value={encargado}
                        onChange={(e) => setEncargado(e.target.value)}
                        placeholder="Nombre del usuario..."
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !encargado}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Guardando..." : "Reasignar"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
