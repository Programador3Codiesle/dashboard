'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { COMPETENCIAS_TEMPLATE } from "@/modules/administracion/constants";
import { EvaluacionDesempeño, FormatoDesempenoAPI, FormatoDesempenoDTO } from "@/modules/administracion/types";
import type { EscalaDesempeño } from "@/modules/administracion/types";
import { formatoDesempenoService } from "@/modules/administracion/services/formato-desempeno.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { useAuth } from "@/core/auth/hooks/useAuth";

// Mapeo de competencias a campos del API (orden secuencial)
const MAPEO_COMPETENCIAS: string[] = [
  'trabajo_equipo_e', 'part_activa_e', 'prop_iniciativas_e', // Trabajo en Equipo
  'rel_interpersonales_e', 'comunicacion_efect_e', 'discrecion_e', // Relaciones Interpersonales
  'responsabilidad_e', 'acatamiento_e', // Responsabilidad
  'compromiso_e', 'conocimiento_pro_e', 'conocimiento_metas_e', // Compromiso y Sentido de Pertenencia
  'adaptabilidad_e', 'control_estres_e', // Adaptabilidad al Cambio
  'solu_conflictos_e', 'estrategia_e', 'solu_adecuadas_e', // Solución de Conflictos
  'ident_cliente_e', 'serv_cliente_e', // Servicio al Cliente
  'part_capacitacion_e', 'info_peligros_e', 'info_accidentes_e', 'info_salud_e', 'uso_epp_e', 'llamados_aten_e', 'accidentes_e' // SG - SST
];

// Componente memoizado para cada fila de competencia
const CompetenciaRow = React.memo(({
  competencia,
  onValueChange,
  isEven
}: {
  competencia: any,
  onValueChange: (id: string, value: number) => void,
  isEven: boolean
}) => {
  return (
    <tr className={`border-b border-blue-50 transition-colors ${isEven ? 'bg-white' : 'bg-blue-50/30'} hover:brand-bg-light`}>
      <td className="py-4 px-6 text-sm text-gray-700 leading-relaxed">{competencia.descripcion}</td>
      <td className="py-4 px-6 text-center">
        <select
          className="border-2 border-blue-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all bg-white hover:border-blue-400 shadow-sm w-20 text-center"
          value={competencia.autoEvaluacion || ""}
          onChange={(e) => onValueChange(competencia.id, parseInt(e.target.value))}
          required
        >
          <option value="">-</option>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </td>
      <td className="py-4 px-6 text-center">
        <input
          type="text"
          className="border-2 border-gray-200 rounded-lg p-2.5 text-sm bg-gray-100/80 text-gray-400 font-semibold cursor-not-allowed text-center w-20 shadow-inner"
          value="-"
          disabled
        />
      </td>
    </tr>
  );
});

CompetenciaRow.displayName = "CompetenciaRow";

// Secciones estáticas memoizadas
const HeaderSeccion = React.memo(({ evaluacionExistente }: { evaluacionExistente: any }) => (
  <div>
    <h1 className="text-3xl font-bold brand-text tracking-tight">Formato Desempeño Empleado</h1>
    <p className="text-gray-500 mt-1">Autoevaluación de desempeño por empleado</p>
    {evaluacionExistente && (
      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
        Se encontró una evaluación existente. Puede editarla y guardar los cambios.
      </div>
    )}
  </div>
));
HeaderSeccion.displayName = "HeaderSeccion";

const InfoGeneral = React.memo(({ formData, onFieldChange }: { formData: any, onFieldChange: (field: string, value: string) => void }) => (
  <div className="border-b-2 border-blue-100 pb-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
        <Save className="text-white" size={20} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Información General</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Empleado a Valorar <span className="text-red-500">*</span></label>
        <input type="text" className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm" value={formData.nombreEmpleado} onChange={(e) => onFieldChange('nombreEmpleado', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Área <span className="text-red-500">*</span></label>
        <input type="text" className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm" value={formData.area} onChange={(e) => onFieldChange('area', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo <span className="text-red-500">*</span></label>
        <input type="text" className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm" value={formData.cargo} onChange={(e) => onFieldChange('cargo', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Sede <span className="text-red-500">*</span></label>
        <input type="text" className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm" value={formData.sede} onChange={(e) => onFieldChange('sede', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha <span className="text-red-500">*</span></label>
        <input type="date" className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm" value={formData.fecha} onChange={(e) => onFieldChange('fecha', e.target.value)} required />
      </div>
    </div>
  </div>
));
InfoGeneral.displayName = "InfoGeneral";

const EscalaEvaluacion = React.memo(() => (
  <div className="bg-blue-50/50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
    <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
      Escala de Evaluación
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
      <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
        <span className="font-bold text-green-700">Sobresaliente (5):</span>
        <p className="text-gray-600 text-xs mt-2 leading-relaxed">Desempeño que consistentemente excede las expectativas</p>
      </div>
      <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
        <span className="font-bold text-blue-700">Bueno (4):</span>
        <p className="text-gray-600 text-xs mt-2 leading-relaxed">Desempeño que cumple con las expectativas</p>
      </div>
      <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
        <span className="font-bold brand-text">Satisfactorio (3):</span>
        <p className="text-gray-600 text-xs mt-2 leading-relaxed">Cumple pero presenta algunas inconsistencias</p>
      </div>
      <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
        <span className="font-bold text-orange-600">Regular (2):</span>
        <p className="text-gray-600 text-xs mt-2 leading-relaxed">Por debajo de lo esperado</p>
      </div>
      <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
        <span className="font-bold text-red-600">No satisfactorio (1):</span>
        <p className="text-gray-600 text-xs mt-2 leading-relaxed">Muy inferior a lo esperado</p>
      </div>
    </div>
  </div>
));
EscalaEvaluacion.displayName = "EscalaEvaluacion";

export default function FormatoDesempenoEmpleadoPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [evaluacionExistente, setEvaluacionExistente] = useState<FormatoDesempenoAPI | null>(null);
  const [loadingEvaluacion, setLoadingEvaluacion] = useState(true);

  const [formData, setFormData] = useState<EvaluacionDesempeño>({
    nombreEmpleado: user?.nombre_usuario || "",
    area: "",
    cargo: "",
    sede: "",
    fecha: new Date().toISOString().split("T")[0],
    competencias: COMPETENCIAS_TEMPLATE.flatMap((categoria, catIdx) =>
      categoria.items.map((item, itemIdx) => ({
        id: `${catIdx}-${itemIdx}`,
        categoria: categoria.categoria,
        descripcion: item,
        autoEvaluacion: undefined,
      }))
    ),
    necesidadesCapacitacion: "",
    compromisosTrabajador: "",
    esAutoEvaluacion: true,
  });
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cargarEvaluacion = useCallback(async () => {
    if (!user?.nit_usuario) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoadingEvaluacion(true);
    try {
      const evaluacion = await formatoDesempenoService.obtenerEvaluacion(user.nit_usuario);

      if (mountedRef.current && !abortController.signal.aborted && evaluacion) {
        setEvaluacionExistente(evaluacion);

        const competenciasFlat = COMPETENCIAS_TEMPLATE.flatMap((categoria) => categoria.items);
        const competenciasMapeadas = competenciasFlat.map((descripcion, idx) => {
          const campo = MAPEO_COMPETENCIAS[idx] as keyof FormatoDesempenoAPI;
          const valor = evaluacion[campo] as number | undefined;

          const categoriaObj = COMPETENCIAS_TEMPLATE.find(cat => cat.items.includes(descripcion));

          return {
            id: `${idx}`,
            categoria: categoriaObj?.categoria || "",
            descripcion,
            autoEvaluacion: valor as EscalaDesempeño | undefined,
          };
        });

        setFormData({
          nombreEmpleado: evaluacion.empleado,
          area: evaluacion.area,
          cargo: evaluacion.cargo,
          sede: evaluacion.sede,
          fecha: evaluacion.fecha,
          competencias: competenciasMapeadas,
          necesidadesCapacitacion: evaluacion.capacidades_entrenamiento || "",
          compromisosTrabajador: evaluacion.compromisos || "",
          esAutoEvaluacion: true,
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || abortController.signal.aborted) return;
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setLoadingEvaluacion(false);
      }
    }
  }, [user?.nit_usuario]);

  useEffect(() => {
    mountedRef.current = true;
    cargarEvaluacion();

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cargarEvaluacion]);

  const handleFieldChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCompetenciaChange = useCallback((id: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      competencias: prev.competencias.map((comp) =>
        comp.id === id ? { ...comp, autoEvaluacion: value as EscalaDesempeño } : comp
      ),
    }));
  }, []);

  const mapearCompetenciasADTO = useCallback((): Partial<FormatoDesempenoDTO> => {
    const dto: any = {};
    formData.competencias.forEach((comp, idx) => {
      const campo = MAPEO_COMPETENCIAS[idx];
      if (campo && comp.autoEvaluacion !== undefined) {
        dto[campo] = comp.autoEvaluacion;
      }
    });
    return dto as Partial<FormatoDesempenoDTO>;
  }, [formData.competencias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.nit_usuario || loading) return;

    setLoading(true);
    try {
      const competenciasDTO = mapearCompetenciasADTO();
      const dto: FormatoDesempenoDTO = {
        nit_empleado: user.nit_usuario,
        empleado: formData.nombreEmpleado,
        area: formData.area,
        cargo: formData.cargo,
        sede: formData.sede,
        id_empresa: user?.empresa || evaluacionExistente?.id_empresa || 1,
        ...competenciasDTO,
      } as FormatoDesempenoDTO;

      await formatoDesempenoService.crearActualizarEvaluacion(dto);
      showSuccess("Autoevaluación guardada correctamente");

      const evaluacionActualizada = await formatoDesempenoService.obtenerEvaluacion(user.nit_usuario);
      if (evaluacionActualizada) setEvaluacionExistente(evaluacionActualizada);
    } catch (error: any) {
      showError(error.message || "Error al guardar la autoevaluación");
    } finally {
      setLoading(false);
    }
  };

  const promedios = useMemo(() => {
    const comps = formData.competencias.filter((c) => c.autoEvaluacion);
    if (comps.length === 0) return 0;
    return comps.reduce((acc, c) => acc + (c.autoEvaluacion || 0), 0) / comps.length;
  }, [formData.competencias]);

  const getNivelDesempeño = useCallback((promedio: number) => {
    if (promedio >= 4.5) return { texto: "Sobresaliente", color: "text-green-600" };
    if (promedio >= 4.0) return { texto: "Bueno", color: "text-blue-600" };
    if (promedio >= 3.1) return { texto: "Satisfactorio", color: "text-yellow-600" };
    if (promedio >= 2.1) return { texto: "Regular", color: "text-orange-600" };
    return { texto: "No satisfactorio", color: "text-red-600" };
  }, []);

  if (loadingEvaluacion) {
    return <div className="space-y-6"><div className="text-center py-10 text-gray-500">Cargando evaluación...</div></div>;
  }

  return (
    <div className="space-y-6">
      <HeaderSeccion evaluacionExistente={evaluacionExistente} />
      <form onSubmit={handleSubmit}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 space-y-8">
          <InfoGeneral formData={formData} onFieldChange={handleFieldChange} />
          <EscalaEvaluacion />

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Desempeño Laboral</h2>
            <div className="overflow-x-auto rounded-xl border-2 border-blue-200 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-500 border-b-2 border-blue-600">
                    <th className="text-left py-4 px-6 font-bold text-white">Competencia</th>
                    <th className="text-center py-4 px-6 font-bold text-white">Auto Evaluación 30%</th>
                    <th className="text-center py-4 px-6 font-bold text-white">Jefe Inmediato 70%</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPETENCIAS_TEMPLATE.map((cat) => (
                    <React.Fragment key={cat.categoria}>
                      <tr className="bg-blue-100 border-y-2 border-blue-200">
                        <td colSpan={3} className="py-3 px-6 font-bold text-blue-900 text-base">{cat.categoria}</td>
                      </tr>
                      {formData.competencias
                        .filter(c => c.categoria === cat.categoria)
                        .map((comp, idx) => (
                          <CompetenciaRow key={comp.id} competencia={comp} onValueChange={handleCompetenciaChange} isEven={idx % 2 === 0} />
                        ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-6 bg-blue-50/50 rounded-2xl border-2 border-blue-200 shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg">Promedio Auto Evaluación:</span>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-extrabold ${getNivelDesempeño(promedios).color}`}>
                    {promedios.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm text-gray-600">
                  Nivel de Desempeño: <span className={`text-2xl font-bold  ${getNivelDesempeño(promedios).color}`}>{getNivelDesempeño(promedios).texto}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t-2 border-blue-100">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-3 brand-bg brand-bg-hover text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>{loading ? "Guardando..." : evaluacionExistente ? "Actualizar Autoevaluación" : "Guardar Autoevaluación"}</span>
            </button>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
