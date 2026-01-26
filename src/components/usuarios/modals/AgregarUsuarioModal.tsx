'use client';
import Modal from "../../shared/ui/Modal";
import { AgregarUsuarioModalProps } from "@/modules/usuarios/types";
import { useState, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { OptimizedInput } from "@/components/shared/ui/OptimizedInput";

export default function AgregarUsuarioModal({
    open,
    onClose,
    onSave,
    perfilesDisponibles = []
}: AgregarUsuarioModalProps) {

    const [formData, setFormData] = useState({
        nit: '',
        perfil: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setFormData({
            nit: '',
            perfil: perfilesDisponibles[0]?.id?.toString() || '',
        });
        setErrors({});
    }, [open, perfilesDisponibles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nit.trim()) newErrors.nit = 'El NIT es requerido';
        else if (!/^\d+$/.test(formData.nit)) newErrors.nit = 'El NIT debe ser numérico';

        if (!formData.perfil) newErrors.perfil = 'Seleccione un perfil';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await onSave(formData.nit, formData.perfil);
            onClose();
        } catch (error) {
            console.error(error);
            setErrors({ submit: 'Error al guardar el usuario' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const errorClass = "text-red-500 text-xs mt-1";

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Agregar Nuevo Usuario"
            width="500px"
        >
            <form onSubmit={handleSubmit} className="space-y-5 p-1">

                {/* NIT */}
                <OptimizedInput
                    label="NIT del usuario"
                    labelClassName={labelClass}
                    required
                    type="number"
                    name="nit"
                    value={formData.nit}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, nit: val }))}
                    className={inputClass}
                    placeholder="Ej: 1095944272"
                    min="1"
                />

                {/* Perfil */}
                <div>
                    <label className={labelClass}>Perfil <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <select
                            name="perfil"
                            value={formData.perfil}
                            onChange={handleChange}
                            className={`${inputClass} appearance-none pr-10`}
                            disabled={perfilesDisponibles.length === 0}
                        >
                            <option value="">Seleccione un perfil</option>
                            {perfilesDisponibles.map(perfil => (
                                <option key={perfil.id} value={perfil.id}>
                                    {perfil.nombre}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                    </div>
                    {errors.perfil && <span className={errorClass}>{errors.perfil}</span>}
                    {perfilesDisponibles.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">No hay perfiles disponibles</p>
                    )}
                </div>

                {/* Error General */}
                {errors.submit && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {errors.submit}
                    </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-white brand-bg brand-bg-hover transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
}