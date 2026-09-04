'use client';
import Modal from "@/components/shared/ui/Modal";
import { EditUsuarioModalProps } from "@/modules/usuarios/types";
import { useState, useEffect } from "react";

export default function EditUsuarioModal({ open, usuario, onClose, onSave, perfilesDisponibles, perfilActual }: EditUsuarioModalProps) {
    const [selectedPerfil, setSelectedPerfil] = useState<string>("");

    useEffect(() => {
        if (open && perfilActual) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedPerfil(perfilActual.id);
        } else if (open) {
            setSelectedPerfil("");
        }
    }, [open, perfilActual]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPerfil) {
            onSave(selectedPerfil);
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={`Editar Perfil - ${usuario?.nombre}`} width="500px">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700">
                        Perfil actual:
                    </label>
                    {perfilActual ? (
                        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
                            <span className="text-sm font-semibold text-green-700">
                                {perfilActual.nombre}
                            </span>
                        </div>
                    ) : (
                        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-100 p-3">
                            <span className="text-sm text-gray-500">
                                Sin perfil asignado
                            </span>
                        </div>
                    )}
                </div>

                <div>
                    <label className="mb-2.5 block text-sm font-medium text-gray-700">
                        Seleccionar nuevo perfil:
                    </label>
                    <div className="max-h-[300px] overflow-y-auto pr-1">
                        {perfilesDisponibles.map((perfil) => {
                            const selected = selectedPerfil === perfil.id;
                            return (
                            <label
                                key={perfil.id}
                                className={`mb-2 flex cursor-pointer items-center rounded-lg border-2 p-3 transition-all ${
                                    selected
                                        ? "brand-border brand-bg-light"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="perfil"
                                    checked={selected}
                                    onChange={() => setSelectedPerfil(perfil.id)}
                                    className="mr-3 h-[18px] w-[18px] cursor-pointer accent-[var(--color-primary)]"
                                />
                                <span className="text-sm font-medium">
                                    {perfil.nombre}
                                </span>
                            </label>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={!selectedPerfil}
                        className="w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium text-white brand-bg brand-bg-hover transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
