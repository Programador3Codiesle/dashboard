'use client';
import Modal from "@/components/shared/ui/Modal";
import { AgregarSedesModalProps } from "@/modules/usuarios/types";
import { Check, X } from "lucide-react";
import ConfirmModal from "@/components/shared/ui/ConfirmModal";
import { useState } from "react";

export default function AgregarSedesModal({ open, usuario, onClose, onAsignar, onEliminar, sedesDisponibles, sedesUsuario }: AgregarSedesModalProps) {
    const [sedeAEliminar, setSedeAEliminar] = useState<string | null>(null);

    const sedesUsuarioIds = sedesUsuario.map(s => s.id);

    const handleToggleSede = (sedeId: string) => {
        const isActiva = sedesUsuarioIds.includes(sedeId);
        if (isActiva) {
            setSedeAEliminar(sedeId);
        } else {
            onAsignar(sedeId);
        }
    };

    const handleConfirmEliminar = () => {
        if (sedeAEliminar) {
            onEliminar(sedeAEliminar);
            setSedeAEliminar(null);
        }
    };

    const handleCancelEliminar = () => {
        setSedeAEliminar(null);
    };

    return (
        <Modal open={open} onClose={onClose} title={`Gestionar Sedes - ${usuario?.nombre}`} width="600px">
            <div>
                <p className="mb-5 text-sm text-gray-500">
                    Haz clic en una sede para activarla o desactivarla:
                </p>

                <div className="mb-5 max-h-[400px] overflow-y-auto">
                    {sedesDisponibles.map((sede) => {
                        const isActiva = sedesUsuarioIds.includes(sede.id.toString());
                        return (
                            <button
                                key={sede.id}
                                type="button"
                                onClick={() => handleToggleSede(sede.id.toString())}
                                className={`mb-2.5 flex w-full flex-col gap-2 rounded-lg border-2 p-3.5 text-left transition-all sm:flex-row sm:items-center sm:justify-between ${
                                    isActiva
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
                                            isActiva ? "bg-green-500" : "bg-gray-200"
                                        }`}
                                    >
                                        {isActiva ? <Check size={14} /> : <X size={14} className="text-gray-500" />}
                                    </span>
                                    <span className={`truncate text-sm font-medium ${isActiva ? "text-green-700" : "text-gray-700"}`}>
                                        {sede.nombre}
                                    </span>
                                </div>
                                <span
                                    className={`self-start rounded-full px-3 py-1 text-xs font-semibold sm:self-auto ${
                                        isActiva
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-500"
                                    }`}
                                >
                                    {isActiva ? "Activa" : "Inactiva"}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                    <span className="text-sm text-gray-500">
                        Sedes activas:{" "}
                        <strong className="text-green-700">{sedesUsuarioIds.length}</strong>
                        {" "}/ {sedesDisponibles.length}
                    </span>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            <ConfirmModal
                open={!!sedeAEliminar}
                onConfirm={handleConfirmEliminar}
                onCancel={handleCancelEliminar}
                title="Eliminar sede"
                message="¿Estás seguro de que deseas eliminar esta sede del usuario?"
                variant="danger"
            />
        </Modal>
    );
}
