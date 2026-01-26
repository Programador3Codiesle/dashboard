'use client';
import Modal from "@/components/shared/ui/Modal";
import { useState } from "react";
import { useTicketsActions } from "@/modules/tickets/hooks/useTicketsActions";
import { CrearTicketDTO } from "@/modules/tickets/types";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { useToast } from "@/components/shared/ui/ToastContext";
import { Upload, X, ChevronDown } from "lucide-react";
import { OptimizedInput } from "@/components/shared/ui/OptimizedInput";
import { OptimizedTextarea } from "@/components/shared/ui/OptimizedTextarea";

export default function NuevoTicketModal({
    open,
    onClose
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { crearTicket } = useTicketsActions();
    const { user } = useAuth();
    const { showError } = useToast();
    const [form, setForm] = useState<CrearTicketDTO>({
        tipoSoporte: "",
        anydesk: "",
        descripcion: ""
    });
    const [archivo, setArchivo] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.tipoSoporte || !form.descripcion) return;
        setLoading(true);

        try {
            let archivoUrl: string | null = null;

            // 1) Subir el archivo si existe
            if (archivo) {
                const formData = new FormData();
                formData.append("file", archivo);

                const resp = await fetch("/api/tickets/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!resp.ok) {
                    throw new Error("No se pudo subir el archivo");
                }

                const json = await resp.json();
                if (!json.status || !json.url) {
                    throw new Error(json.message || "No se pudo subir el archivo");
                }

                archivoUrl = json.url as string;
            }

            // 2) Crear el ticket enviando la URL real (o null si no hay archivo)
            await crearTicket({ ...form, archivoUrl });

            // Limpiar el formulario y cerrar modal
            setForm({
                tipoSoporte: "",
                anydesk: "",
                descripcion: ""
            });
            setArchivo(null);
            onClose();
        } catch (err: any) {
            console.error(err);
            // Mostrar toast específico si es error de subida de archivo
            const errorMessage = err?.message || "Ocurrió un error al crear el ticket";
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <Modal open={open} onClose={onClose} title="Nuevo ticket" width="640px">
            <form onSubmit={submit} className="space-y-5 p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Tipo de soporte <span className="text-red-500">*</span></label>
                        <div className="relative mt-1">
                            <select
                                className={`${inputClass} appearance-none pr-10`}
                                value={form.tipoSoporte}
                                onChange={(e) => setForm({ ...form, tipoSoporte: e.target.value })}
                                required
                            >
                                <option value="">Seleccione...</option>
                                <option>Insumos de Impresora(Toner)</option>
                                <option>Hardware</option>
                                <option>Software</option>
                                <option>CRM Comercial</option>
                                <option>CRM PosVenta</option>
                                <option>CRM DMS</option>
                                <option>DMS</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <OptimizedInput
                        label="Anydesk"
                        labelClassName={labelClass}
                        className={`mt-1 ${inputClass}`}
                        value={form.anydesk}
                        onValueChange={(val) => setForm({ ...form, anydesk: val })}
                        placeholder="Ej: 123 456 789"
                    />
                </div>

                <OptimizedTextarea
                    label="Descripción del problema"
                    labelClassName={labelClass}
                    className={`mt-1 ${inputClass} min-h-[120px] resize-y`}
                    value={form.descripcion}
                    onValueChange={(val) => setForm({ ...form, descripcion: val })}
                    placeholder="Describe detalladamente el problema..."
                    required
                />

                <div>
                    <label className={labelClass}>Adjuntar archivo (opcional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                        />
                        <div className="space-y-1 text-center">
                            {archivo ? (
                                <div className="flex items-center justify-center text-indigo-600">
                                    <span className="font-medium">{archivo.name}</span>
                                    <button type="button" onClick={(e) => { e.preventDefault(); setArchivo(null); }} className="ml-2 text-gray-400 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-10 w-10 text-gray-400" />
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <span className="font-medium text-indigo-600 hover:text-indigo-500">Sube un archivo</span>
                                        <p className="pl-1">o arrástralo aquí</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 5MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gray-900 hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Creando..." : "Crear ticket"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
