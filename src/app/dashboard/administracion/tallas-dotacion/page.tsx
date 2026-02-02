'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Save, User, Loader2 } from "lucide-react";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { useToast } from "@/components/shared/ui/ToastContext";
import { tallasDotacionService, TallaDotacion } from "@/modules/administracion/services/tallas-dotacion.service";
import { ActualizarTallaDotacionDTO } from "@/modules/administracion/types";
import { TallaDotacionForm } from "@/components/administracion/forms/TallaDotacionForm";

export default function TallasDotacionPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [tallasActuales, setTallasActuales] = useState<TallaDotacion | null>(null);
  const idEmpresa = user?.empresa ?? 1;
  const [formData, setFormData] = useState<ActualizarTallaDotacionDTO>({
    genero: "",
    tallaCamisa: "",
    tallaPantalon: "",
    tallaBotas: "",
    id_empresa: idEmpresa,
  });
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const prevEmpresaRef = useRef<number | undefined>(undefined);

  const cargarTallas = useCallback(async (idEmp?: number) => {
    setCargando(true);
    try {
      const emp = idEmp ?? user?.empresa ?? 1;
      const datos = await tallasDotacionService.obtenerTallas(emp);
      setTallasActuales(datos);
      setFormData((prev) => ({
        ...prev,
        genero: datos.genero === "0" || datos.genero === "1" ? datos.genero : "",
        tallaCamisa: datos.tallaCamisa || "",
        tallaPantalon: datos.tallaPantalon || "",
        tallaBotas: datos.tallaBotas || "",
        id_empresa: emp,
      }));
    } catch (error) {
      console.error("Error al cargar tallas:", error);
      showError("Error al cargar las tallas actuales");
    } finally {
      setCargando(false);
    }
  }, [showError, user?.empresa]);

  useEffect(() => {
    if (user) {
      cargarTallas(user.empresa ?? 1);
    }
  }, [user, cargarTallas]);

  // Sincronizar id_empresa cuando el usuario cambia de empresa en el dashboard (cookie)
  useEffect(() => {
    const emp = user?.empresa;
    if (emp == null) return;
    const prev = prevEmpresaRef.current;
    prevEmpresaRef.current = emp;
    setFormData((prevForm) => ({ ...prevForm, id_empresa: emp }));
    if (prev !== undefined && prev !== emp) {
      cargarTallas(emp);
    }
  }, [user?.empresa, cargarTallas]);

  const handleFormDataChange = useCallback((data: ActualizarTallaDotacionDTO) => {
    setFormData(data);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const payload: ActualizarTallaDotacionDTO = {
        ...formData,
        id_empresa: formData.id_empresa ?? user?.empresa ?? 1,
      };
      await tallasDotacionService.actualizarTallas(payload);
      await cargarTallas(payload.id_empresa);
      showSuccess("Tallas actualizadas correctamente");
    } catch (error) {
      console.error("Error al actualizar tallas:", error);
      showError("Error al actualizar las tallas");
    } finally {
      setLoading(false);
    }
  }, [formData, user?.empresa, cargarTallas, showSuccess, showError]);


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
                Actualización de tallas para {user?.nombre_usuario || user?.user || "USUARIO"}
              </h2>
              <p className="text-gray-600 mt-1">Aquí puedes actualizar la información de tallas. Selecciona las opciones correspondientes y luego haz clic en Guardar.</p>
            </div>
          </div>
        </div>

        {/* Información Actual */}
        {cargando ? (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={20} />
              <span>Cargando información...</span>
            </div>
          </div>
        ) : tallasActuales && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Información de tallas actual</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-600">NIT:</span>
                <p className="font-medium text-gray-900">{tallasActuales.nit}</p>
              </div>
              <div>
                <span className="text-gray-600">Género:</span>
                <p className="font-medium text-gray-900">
                  {tallasActuales.genero === "1" ? "Hombre" : tallasActuales.genero === "0" ? "Mujer" : tallasActuales.genero || "No definido"}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Camisa:</span>
                <p className="font-medium text-gray-900">{tallasActuales.tallaCamisa || "No definido"}</p>
              </div>
              <div>
                <span className="text-gray-600">Pantalón:</span>
                <p className="font-medium text-gray-900">{tallasActuales.tallaPantalon || "No definido"}</p>
              </div>
              <div>
                <span className="text-gray-600">Última actualización:</span>
                <p className="font-medium text-gray-900">{tallasActuales.ultimaActualizacion || "Nunca"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <TallaDotacionForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
          />

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

