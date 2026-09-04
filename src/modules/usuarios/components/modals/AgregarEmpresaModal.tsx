'use client';
import { useState, useEffect } from "react";
import Modal from "@/components/shared/ui/Modal";
import { AgregarEmpresaModalProps } from "@/modules/usuarios/types";
import { USUARIOS_STYLES } from "@/modules/usuarios/constants";

export default function AgregarEmpresaModal({ open, usuario, onClose, onSave, empresasDisponibles }: AgregarEmpresaModalProps) {
    const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            // Reset al abrir: mismo comportamiento que antes (estado derivado del usuario).
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedEmpresas(usuario?.empresas || []);
        }
    }, [open, usuario]);

    const toggleEmpresa = (empresaId: string) => {
        setSelectedEmpresas(prev =>
            prev.includes(empresaId)
                ? prev.filter(e => e !== empresaId)
                : [...prev, empresaId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Enviamos siempre el listado seleccionado (puede ser vacío para eliminar todas)
        onSave(selectedEmpresas);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title={`Agregar Empresas - ${usuario?.nombre}`} width="500px">
            <form onSubmit={handleSubmit}>
                <p className="mb-4 text-sm text-gray-500">
                    Selecciona las empresas a las que tendrá acceso este usuario:
                </p>

                <div className="mb-5 space-y-2">
                    {empresasDisponibles.map((empresa) => (
                        <label
                            key={empresa.id}
                            className={`flex items-center p-3.5 border-2 rounded-lg cursor-pointer transition-all duration-200 ${selectedEmpresas.includes(empresa.id)
                                    ? "border-[var(--color-primary)] brand-bg-light"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedEmpresas.includes(empresa.id)}
                                onChange={() => toggleEmpresa(empresa.id)}
                                className="mr-3 w-5 h-5 cursor-pointer accent-[var(--color-primary)]"
                            />
                            <span className="text-2xl mr-3">
                                {empresa.logo}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">
                                {empresa.nombre}
                            </span>
                        </label>
                    ))}
                </div>

                <div className={USUARIOS_STYLES.empresasHint}>
                    <p className={USUARIOS_STYLES.empresasHintText}>
                        <strong>Empresas seleccionadas:</strong> {selectedEmpresas.length > 0 ? selectedEmpresas.length : "Ninguna"}
                    </p>
                </div>

                <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-md border-none cursor-pointer font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-4 py-2 text-white rounded-md border-none font-medium transition-all brand-bg brand-bg-hover cursor-pointer"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
