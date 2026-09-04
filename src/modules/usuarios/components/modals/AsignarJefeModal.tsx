'use client';
import Modal from "@/components/shared/ui/Modal";
import { useState } from "react";
import { AsignarJefeModalProps } from "@/modules/usuarios/types";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/shared/ui/ConfirmModal";

export default function AsignarJefeModal({ open, usuario, onClose, onAsignar, onEliminar, jefesDisponibles, jefesUsuario }: AsignarJefeModalProps) {
    const [selectedJefe, setSelectedJefe] = useState<string | null>(null);
    const [jefeAEliminar, setJefeAEliminar] = useState<string | null>(null);

    const jefesDisponiblesParaAsignar = jefesDisponibles.filter(
        jefe => !jefesUsuario.some(j => j.id === jefe.id)
    );

    const handleAsignar = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedJefe !== null) {
            onAsignar(selectedJefe);
            setSelectedJefe(null);
        }
    };

    const handleOpenEliminar = (jefeId: string) => {
        setJefeAEliminar(jefeId);
    };

    const handleConfirmEliminar = () => {
        if (jefeAEliminar) {
            onEliminar(jefeAEliminar);
        }
        setJefeAEliminar(null);
    };

    const handleCancelEliminar = () => {
        setJefeAEliminar(null);
    };

    const closeButtonClass =
        "w-full sm:w-auto rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors";

    return (
        <>
        <Modal open={open} onClose={onClose} title={`Gestionar Jefes - ${usuario?.nombre}`} width="600px">
            <div>
                {jefesUsuario.length > 0 && (
                    <div className="mb-6">
                        <h3 className="mb-3 text-base font-semibold text-gray-800">
                            Jefes asignados:
                        </h3>
                        <div className="flex flex-col gap-2">
                            {jefesUsuario.map((jefe) => (
                                <div
                                    key={jefe.id}
                                    className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <span className="min-w-0 break-words text-sm font-medium">
                                        {jefe.nombre}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEliminar(jefe.id.toString())}
                                        className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {jefesDisponiblesParaAsignar.length > 0 && (
                    <form onSubmit={handleAsignar}>
                        <p className="mb-4 text-sm text-gray-500">
                            Selecciona un jefe para asignar:
                        </p>

                        <div className="mb-5 max-h-[300px] overflow-y-auto">
                            {jefesDisponiblesParaAsignar.map((jefe) => {
                                const selected = selectedJefe === jefe.id.toString();
                                return (
                                <label
                                    key={jefe.id}
                                    className={`mb-2.5 flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all ${
                                        selected
                                            ? "brand-border brand-bg-light"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="jefe"
                                        checked={selected}
                                        onChange={() => setSelectedJefe(jefe.id.toString())}
                                        className="mr-3 h-[18px] w-[18px] cursor-pointer accent-[var(--color-primary)]"
                                    />
                                    <span className="text-sm font-semibold">
                                        {jefe.nombre}
                                    </span>
                                </label>
                                );
                            })}
                        </div>

                        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className={closeButtonClass}
                            >
                                Cerrar
                            </button>
                            <button
                                type="submit"
                                disabled={selectedJefe === null}
                                className="w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium text-white brand-bg brand-bg-hover transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Asignar
                            </button>
                        </div>
                    </form>
                )}

                {jefesDisponiblesParaAsignar.length === 0 && (
                    <>
                        {jefesUsuario.length === 0 && (
                            <div className="mb-4 p-5 text-center text-sm text-gray-500">
                                <p>No hay jefes disponibles para asignar.</p>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className={closeButtonClass}
                            >
                                Cerrar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>

        <ConfirmModal
            open={!!jefeAEliminar}
            onConfirm={handleConfirmEliminar}
            onCancel={handleCancelEliminar}
            title="Eliminar jefe"
            message="¿Estás seguro de que deseas eliminar este jefe del usuario?"
            variant="danger"
        />
        </>
    );
}
