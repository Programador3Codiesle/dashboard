'use client';
import Modal from "@/components/shared/ui/Modal";
import { useState } from "react";
import { useTicketsActions } from "@/modules/tickets/hooks/useTicketsActions";
import { encargadosDisponibles } from "@/modules/tickets/constants";
import { ChevronDown } from "lucide-react";

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
    const [encargadoId, setEncargadoId] = useState<string>("");
    const [prioridad, setPrioridad] = useState<"alta" | "media" | "baja">("media");
    const [loading, setLoading] = useState(false);
    const { reasignar } = useTicketsActions();

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ticketId || !encargadoId) return;
        setLoading(true);
        try {
            await reasignar(ticketId, encargadoId, prioridad);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <Modal open={open} onClose={onClose} title="Reasignar ticket" width="420px">
            <form onSubmit={submit} className="space-y-5 p-1">
                <div>
                    <label className={labelClass}>Nuevo encargado</label>
                    <div className="relative mt-1">
                        <select
                            className={`${inputClass} appearance-none pr-10`}
                            value={encargadoId}
                            onChange={(e) => setEncargadoId(e.target.value)}
                            autoFocus
                        >
                            <option value="">Seleccione un encargado...</option>
                            {encargadosDisponibles.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.nombre}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Prioridad</label>
                    <div className="relative mt-1">
                        <select
                            className={`${inputClass} appearance-none pr-10`}
                            value={prioridad}
                            onChange={(e) => setPrioridad(e.target.value as any)}
                        >
                            <option value="alta">Alta</option>
                            <option value="media">Media</option>
                            <option value="baja">Baja</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
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
                        disabled={loading || !encargadoId}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Guardando..." : "Reasignar"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
