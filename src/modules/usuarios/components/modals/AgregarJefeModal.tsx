'use client';
import Modal from "@/components/shared/ui/Modal";
import { AgregarJefeModalProps } from "@/modules/usuarios/types";
import { useState, useEffect } from "react";
import { useJefesGeneral, useUsuariosJefes } from "@/modules/usuarios/hooks/useJefesGeneral";
import { useUsuarioActions } from "@/modules/usuarios/hooks/useUsuarioActions";
import { Loader2 } from "lucide-react";
import { OptimizedInput } from "@/components/shared/ui/OptimizedInput";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none brand-focus-ring";

export default function AgregarJefeModal({ open, onClose }: AgregarJefeModalProps) {
    const { jefes, isLoading: loadingJefes, refetch: refetchJefes } = useJefesGeneral();
    const { usuarios, isLoading: loadingUsuarios } = useUsuariosJefes();
    const { crearJefeGeneral } = useUsuarioActions();

    const [selectedNit, setSelectedNit] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            refetchJefes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!open) {
            setSelectedNit("");
            setEmail("");
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNit || !email) return;

        setIsSubmitting(true);
        try {
            const success = await crearJefeGeneral(selectedNit, email);
            if (success) {
                setSelectedNit("");
                setEmail("");
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Gestión de Jefes" width="650px">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="min-w-0">
                    <h3 className="mb-2.5 text-sm font-semibold text-gray-800">Jefes actuales</h3>
                    <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
                        {loadingJefes ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                Cargando jefes...
                            </div>
                        ) : jefes.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                No hay jefes registrados.
                            </div>
                        ) : (
                            jefes.map((jefe) => (
                                <div
                                    key={jefe.id}
                                    className="flex flex-col gap-0.5 border-b border-gray-200 px-3 py-2.5 last:border-b-0"
                                >
                                    <span className="text-sm font-semibold">{jefe.nombre}</span>
                                    <span className="text-xs text-gray-500">NIT: {jefe.nit}</span>
                                    <span className="text-xs text-gray-500 break-all">{jefe.email}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="min-w-0">
                    <h3 className="mb-2.5 text-sm font-semibold text-gray-800">Registrar nuevo jefe</h3>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Seleccionar usuario
                            </label>
                            <select
                                value={selectedNit}
                                onChange={(e) => setSelectedNit(e.target.value)}
                                disabled={loadingUsuarios || usuarios.length === 0}
                                className={inputClass}
                            >
                                <option value="">Seleccione un usuario</option>
                                {usuarios.map((u) => (
                                    <option key={u.id} value={u.id.toString()}>
                                        {u.nombre}
                                    </option>
                                ))}
                            </select>
                            {loadingUsuarios && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Cargando usuarios...
                                </p>
                            )}
                        </div>

                        <OptimizedInput
                            label="Correo electrónico"
                            labelClassName="mb-1.5 block text-sm font-medium text-gray-700"
                            type="email"
                            value={email}
                            onValueChange={(val) => setEmail(val)}
                            required
                            className={inputClass}
                            placeholder="correo@empresa.com"
                        />

                        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedNit || !email || isSubmitting}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white brand-bg brand-bg-hover transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                Registrar jefe
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
