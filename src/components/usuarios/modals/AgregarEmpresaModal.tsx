'use client';
import { useState, useEffect } from "react";
import Modal from "../../shared/ui/Modal";
import { AgregarEmpresaModalProps } from "@/modules/usuarios/types";

export default function AgregarEmpresaModal({ open, usuario, onClose, onSave, empresasDisponibles }: AgregarEmpresaModalProps) {
    const [selectedEmpresas, setSelectedEmpresas] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
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
                                    ? "border-amber-500 bg-amber-50"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedEmpresas.includes(empresa.id)}
                                onChange={() => toggleEmpresa(empresa.id)}
                                className="mr-3 w-5 h-5 cursor-pointer accent-amber-500"
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

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-4">
                    <p className="text-xs text-blue-800 m-0">
                        <strong>Empresas seleccionadas:</strong> {selectedEmpresas.length > 0 ? selectedEmpresas.length : "Ninguna"}
                    </p>
                </div>

                <div className="flex justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded-md border-none cursor-pointer font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-white rounded-md border-none font-medium transition-all bg-amber-500 cursor-pointer hover:bg-amber-600"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
