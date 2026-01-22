'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, User } from "lucide-react";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { useToast } from "@/components/shared/ui/ToastContext";
import { MOCK_TALLA_DOTACION, GENEROS, TALLAS_CAMISA, TALLAS_PANTALON, TALLAS_BOTAS } from "@/modules/administracion/constants";
import { ActualizarTallaDotacionDTO } from "@/modules/administracion/types";
import { ChevronDown } from "lucide-react";

export default function TallasDotacionPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<ActualizarTallaDotacionDTO>({
    genero: MOCK_TALLA_DOTACION.genero,
    tallaCamisa: MOCK_TALLA_DOTACION.tallaCamisa,
    tallaPantalon: MOCK_TALLA_DOTACION.tallaPantalon,
    tallaBotas: MOCK_TALLA_DOTACION.tallaBotas,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulación de guardado - luego se conectará a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess("Tallas actualizadas correctamente");
      console.log("Datos guardados:", formData);
    } catch (error) {
      showError("Error al actualizar las tallas");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Tallas Dotación</h1>
        <p className="text-gray-500 mt-1">Actualiza la información de tallas para tu dotación</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        {/* Información del Empleado */}
        <div className="bg-gradient-to-br from-[var(--color-primary-light)] to-white rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 brand-bg rounded-full flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Actualización de tallas para {user?.nombre_usuario || "USUARIO"}
              </h2>
              <p className="text-gray-600 mt-1">Aquí puedes actualizar la información de tallas. Selecciona las opciones correspondientes y luego haz clic en Guardar.</p>
            </div>
          </div>
        </div>

        {/* Información Actual */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Información de tallas actual</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-600">NIT:</span>
              <p className="font-medium text-gray-900">{MOCK_TALLA_DOTACION.nit}</p>
            </div>
            <div>
              <span className="text-gray-600">Género:</span>
              <p className="font-medium text-gray-900">{MOCK_TALLA_DOTACION.genero}</p>
            </div>
            <div>
              <span className="text-gray-600">Camisa:</span>
              <p className="font-medium text-gray-900">{MOCK_TALLA_DOTACION.tallaCamisa}</p>
            </div>
            <div>
              <span className="text-gray-600">Pantalón:</span>
              <p className="font-medium text-gray-900">{MOCK_TALLA_DOTACION.tallaPantalon}</p>
            </div>
            <div>
              <span className="text-gray-600">Última actualización:</span>
              <p className="font-medium text-gray-900">{MOCK_TALLA_DOTACION.ultimaActualizacion}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Género */}
            <div>
              <label className={labelClass}>Género <span className="text-red-500">*</span></label>
              <div className="relative mt-1">
                <select
                  className={inputClass}
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  required
                >
                  {GENEROS.map((gen) => (
                    <option key={gen} value={gen}>{gen}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Talla Camisa */}
            <div>
              <label className={labelClass}>Talla Camisa <span className="text-red-500">*</span></label>
              <div className="relative mt-1">
                <select
                  className={inputClass}
                  value={formData.tallaCamisa}
                  onChange={(e) => setFormData({ ...formData, tallaCamisa: e.target.value })}
                  required
                >
                  {TALLAS_CAMISA.map((talla) => (
                    <option key={talla} value={talla}>{talla}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Talla Pantalón */}
            <div>
              <label className={labelClass}>Talla Pantalón <span className="text-red-500">*</span></label>
              <div className="relative mt-1">
                <select
                  className={inputClass}
                  value={formData.tallaPantalon}
                  onChange={(e) => setFormData({ ...formData, tallaPantalon: e.target.value })}
                  required
                >
                  {TALLAS_PANTALON.map((talla) => (
                    <option key={talla} value={talla}>{talla}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Talla Botas */}
            <div>
              <label className={labelClass}>Talla Botas <span className="text-red-500">*</span></label>
              <div className="relative mt-1">
                <select
                  className={inputClass}
                  value={formData.tallaBotas}
                  onChange={(e) => setFormData({ ...formData, tallaBotas: e.target.value })}
                  required
                >
                  {TALLAS_BOTAS.map((talla) => (
                    <option key={talla} value={talla}>{talla}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{loading ? "Guardando..." : "Guardar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

