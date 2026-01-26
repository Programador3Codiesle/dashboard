'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { UserCheck, Save, Users, ArrowLeft } from "lucide-react";
import { COMPETENCIAS_TEMPLATE } from "@/modules/administracion/constants";
import { EvaluacionDesempeño, EmpleadoPendiente, EvaluacionCompleta, CalificarDTO } from "@/modules/administracion/types";
import type { EscalaDesempeño } from "@/modules/administracion/types";
import { evaluacionDesempenoService } from "@/modules/administracion/services/evaluacion-desempeno.service";
import { formatoDesempenoService } from "@/modules/administracion/services/formato-desempeno.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { useAuth } from "@/core/auth/hooks/useAuth";
import { usePagination } from "@/components/shared/ui/hooks/usePagination";
import { Pagination } from "@/components/shared/ui/Pagination";
import { OptimizedTextarea } from "@/components/shared/ui/OptimizedTextarea";

// Mapeo de competencias a campos del API (mismo que formato desempeño)
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

const MAPEO_COMPETENCIAS_J: string[] = [
  'trabajo_equipo_j', 'part_activa_j', 'prop_iniciativas_j',
  'rel_interpersonales_j', 'comunicacion_efect_j', 'discrecion_j',
  'responsabilidad_j', 'acatamiento_j',
  'compromiso_j', 'conocimiento_pro_j', 'conocimiento_metas_j',
  'adaptabilidad_j', 'control_estres_j',
  'solu_conflictos_j', 'estrategia_j', 'solu_adecuadas_j',
  'ident_cliente_j', 'serv_cliente_j',
  'part_capacitacion_j', 'info_peligros_j', 'info_accidentes_j', 'info_salud_j', 'uso_epp_j', 'llamados_aten_j', 'accidentes_j'
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
        <input
          type="text"
          className="border-2 border-gray-200 rounded-lg p-2.5 text-sm bg-gray-100/80 text-gray-700 font-semibold cursor-not-allowed text-center w-20 shadow-inner"
          value={competencia.autoEvaluacion || "-"}
          disabled
          readOnly
        />
      </td>
      <td className="py-4 px-6 text-center">
        <select
          className="border-2 border-blue-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all bg-white hover:border-blue-400 shadow-sm w-20 text-center"
          value={competencia.jefeEvaluacion || ""}
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
    </tr>
  );
});

CompetenciaRow.displayName = "CompetenciaRow";

// Secciones estáticas memoizadas
const HeaderSeccion = React.memo(() => (
  <div>
    <h1 className="text-3xl font-bold brand-text tracking-tight">Evaluación de Desempeño</h1>
    <p className="text-gray-500 mt-1">Evaluación de desempeño por jefe inmediato</p>
  </div>
));
HeaderSeccion.displayName = "HeaderSeccion";

const InfoGeneral = React.memo(({ formData }: { formData: any }) => (
  <div className="border-b-2 border-blue-100 pb-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
        <UserCheck className="text-white" size={20} />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Información General</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Empleado</label>
        <input type="text" className="block w-full border-2 border-gray-200 rounded-xl p-3 text-sm bg-gray-100 cursor-not-allowed" value={formData.nombreEmpleado} readOnly />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Área</label>
        <input type="text" className="block w-full border-2 border-gray-200 rounded-xl p-3 text-sm bg-gray-100 cursor-not-allowed" value={formData.area} readOnly />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo</label>
        <input type="text" className="block w-full border-2 border-gray-200 rounded-xl p-3 text-sm bg-gray-100 cursor-not-allowed" value={formData.cargo} readOnly />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Sede</label>
        <input type="text" className="block w-full border-2 border-gray-200 rounded-xl p-3 text-sm bg-gray-100 cursor-not-allowed" value={formData.sede} readOnly />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
        <input type="date" className="block w-full border-2 border-gray-200 rounded-xl p-3 text-sm bg-gray-100 cursor-not-allowed" value={formData.fecha} readOnly />
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

export default function EvaluacionDesempenoPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [empleadosPendientes, setEmpleadosPendientes] = useState<EmpleadoPendiente[]>([]);
  const [evaluacionActual, setEvaluacionActual] = useState<EvaluacionCompleta | null>(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<EmpleadoPendiente | null>(null);
  const [loadingPendientes, setLoadingPendientes] = useState(true);
  const [loadingEvaluacion, setLoadingEvaluacion] = useState(false);

  const [formData, setFormData] = useState<EvaluacionDesempeño>({
    nombreEmpleado: "",
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
        jefeEvaluacion: undefined,
      }))
    ),
    necesidadesCapacitacion: "",
    compromisosTrabajador: "",
    esAutoEvaluacion: false,
  });
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cargar empleados pendientes al montar
  const cargarPendientes = useCallback(async () => {
    if (!user?.nit_usuario) {
      showError("No se pudo obtener la información del usuario");
      setLoadingPendientes(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoadingPendientes(true);
    try {
      const pendientes = await evaluacionDesempenoService.obtenerEmpleadosPendientesPorCedula(user.nit_usuario);

      if (mountedRef.current && !abortController.signal.aborted) {
        setEmpleadosPendientes(pendientes);
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        return;
      }
      if (mountedRef.current && !abortController.signal.aborted) {
        showError(error.message || "Error al cargar empleados pendientes");
      }
    } finally {
      if (mountedRef.current && !abortController.signal.aborted) {
        setLoadingPendientes(false);
      }
    }
  }, [user?.nit_usuario, showError]);

  useEffect(() => {
    mountedRef.current = true;
    if (user) {
      cargarPendientes();
    }

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, cargarPendientes]);

  const handleSeleccionarEmpleado = useCallback(async (empleado: EmpleadoPendiente) => {
    setFormData({
      nombreEmpleado: "",
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
          jefeEvaluacion: undefined,
        }))
      ),
      necesidadesCapacitacion: "",
      compromisosTrabajador: "",
      esAutoEvaluacion: false,
    });

    setEmpleadoSeleccionado(empleado);
    setEvaluacionActual(null);
    setLoadingEvaluacion(true);

    try {
      const evaluacion = await evaluacionDesempenoService.obtenerEvaluacion(empleado.id_evaluacion);
      setEvaluacionActual(evaluacion);

      const competenciasFlat = COMPETENCIAS_TEMPLATE.flatMap((categoria) => categoria.items);
      const competenciasMapeadas = competenciasFlat.map((descripcion, idx) => {
        const campoE = MAPEO_COMPETENCIAS[idx] as keyof EvaluacionCompleta;
        const campoJ = MAPEO_COMPETENCIAS_J[idx] as keyof EvaluacionCompleta;
        const valorE = evaluacion[campoE] as number | undefined;
        const valorJ = evaluacion[campoJ] as number | undefined;

        const categoriaObj = COMPETENCIAS_TEMPLATE.find(cat => cat.items.includes(descripcion));

        return {
          id: `${idx}`,
          categoria: categoriaObj?.categoria || "",
          descripcion,
          autoEvaluacion: valorE as EscalaDesempeño | undefined,
          jefeEvaluacion: valorJ as EscalaDesempeño | undefined,
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
        esAutoEvaluacion: false,
      });
    } catch (error: any) {
      showError(error.message || "Error al cargar la evaluación");
      setEmpleadoSeleccionado(null);
    } finally {
      setLoadingEvaluacion(false);
    }
  }, [showError]);

  const handleCompetenciaChange = useCallback((id: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      competencias: prev.competencias.map((comp) =>
        comp.id === id ? { ...comp, jefeEvaluacion: value as EscalaDesempeño } : comp
      ),
    }));
  }, []);

  const handleTextareaChange = useCallback((campo: 'necesidadesCapacitacion' | 'compromisosTrabajador', value: string) => {
    setFormData(prev => ({ ...prev, [campo]: value }));
  }, []);

  const mapearCompetenciasADTO = useCallback((): Partial<CalificarDTO> => {
    const dto: any = {};
    formData.competencias.forEach((comp, idx) => {
      const campo = MAPEO_COMPETENCIAS_J[idx];
      if (campo && comp.jefeEvaluacion !== undefined) {
        dto[campo] = comp.jefeEvaluacion;
      }
    });
    return dto as Partial<CalificarDTO>;
  }, [formData.competencias]);

  const getPromedios = useMemo(() => {
    const caps = formData.competencias.filter(c => c.autoEvaluacion !== undefined && c.jefeEvaluacion !== undefined);
    const autoCaps = formData.competencias.filter(c => c.autoEvaluacion !== undefined);
    const jefeCaps = formData.competencias.filter(c => c.jefeEvaluacion !== undefined);

    const calcPromedio = (list: any[], key: 'autoEvaluacion' | 'jefeEvaluacion') => {
      if (list.length === 0) return 0;
      return list.reduce((acc, c) => acc + (c[key] || 0), 0) / list.length;
    };

    const pAuto = calcPromedio(autoCaps, 'autoEvaluacion');
    const pJefe = calcPromedio(jefeCaps, 'jefeEvaluacion');
    const pTotal = (pAuto * 0.30) + (pJefe * 0.70);

    return { pAuto, pJefe, pTotal };
  }, [formData.competencias]);

  const getNivelDesempeño = useCallback((promedio: number) => {
    if (promedio >= 4.5) return { texto: "Sobresaliente", color: "text-green-600" };
    if (promedio >= 4.0) return { texto: "Bueno", color: "text-blue-600" };
    if (promedio >= 3.1) return { texto: "Satisfactorio", color: "text-yellow-600" };
    if (promedio >= 2.1) return { texto: "Regular", color: "text-orange-600" };
    return { texto: "No satisfactorio", color: "text-red-600" };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !evaluacionActual || !empleadoSeleccionado) return;

    setLoading(true);
    try {
      const dto: CalificarDTO = {
        ...mapearCompetenciasADTO() as CalificarDTO,
        calificacion: getPromedios.pTotal,
        capacidades_entrenamiento: formData.necesidadesCapacitacion || "",
        compromisos: formData.compromisosTrabajador || "",
      } as CalificarDTO;

      await evaluacionDesempenoService.calificar(evaluacionActual.id, dto);

      if (evaluacionActual.nit_empleado && user?.nit_usuario) {
        try {
          await formatoDesempenoService.relacionarEvaluacion(evaluacionActual.nit_empleado, user.nit_usuario);
        } catch (error) {
          console.error("Error al relacionar evaluación:", error);
        }
      }

      showSuccess("Evaluación calificada correctamente");
      if (user?.nit_usuario) {
        const pendientes = await evaluacionDesempenoService.obtenerEmpleadosPendientesPorCedula(user.nit_usuario);
        setEmpleadosPendientes(pendientes);
      }
      setEmpleadoSeleccionado(null);
      setEvaluacionActual(null);
    } catch (error: any) {
      showError(error.message || "Error al guardar la evaluación");
    } finally {
      setLoading(false);
    }
  };

  const { currentPage, totalPages, startIndex, endIndex, changePage } = usePagination(empleadosPendientes.length, 5);
  const empleadosMostrados = useMemo(() => empleadosPendientes.slice(startIndex, endIndex), [empleadosPendientes, startIndex, endIndex]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) changePage(1);
  }, [empleadosPendientes.length, currentPage, totalPages, changePage]);

  if (!empleadoSeleccionado) {
    return (
      <div className="space-y-6">
        <HeaderSeccion />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Empleados Pendientes por Calificar</h2>
          </div>
          {loadingPendientes ? (
            <div className="text-center py-10 text-gray-500">Cargando empleados pendientes...</div>
          ) : empleadosPendientes.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No hay empleados pendientes por calificar</div>
          ) : (
            <>
              <div className="space-y-3">
                {empleadosMostrados.map((empleado) => (
                  <div key={`${empleado.id_empleado}-${empleado.id_evaluacion}`} onClick={() => handleSeleccionarEmpleado(empleado)} className="p-4 border border-gray-200 rounded-lg hover:brand-bg-light hover:border-[var(--color-primary)] cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{empleado.nombre}</h3>
                        <p className="text-sm text-gray-500">NIT: {empleado.nit}</p>
                      </div>
                      <div className="text-right"><span className="text-xs brand-badge px-2 py-1 rounded">Pendiente</span></div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && <div className="mt-6 pt-6 border-t border-gray-200"><Pagination currentPage={currentPage} totalPages={totalPages} onChange={changePage} /></div>}
            </>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <HeaderSeccion />
        <button
          onClick={() => { setEmpleadoSeleccionado(null); setEvaluacionActual(null); }}
          className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={14} /> Volver a lista de pendientes
        </button>
      </div>

      {loadingEvaluacion ? (
        <div className="text-center py-10 text-gray-500">Cargando evaluación...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-8 space-y-8">
            <InfoGeneral formData={formData} />
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
                    {COMPETENCIAS_TEMPLATE.map((categoria) => (
                      <React.Fragment key={categoria.categoria}>
                        <tr className="bg-blue-100 border-y-2 border-blue-200">
                          <td colSpan={3} className="py-3 px-6 font-bold text-blue-900 text-base">{categoria.categoria}</td>
                        </tr>
                        {formData.competencias
                          .filter(c => c.categoria === categoria.categoria)
                          .map((comp, idx) => (
                            <CompetenciaRow
                              key={comp.id}
                              competencia={comp}
                              onValueChange={handleCompetenciaChange}
                              isEven={idx % 2 === 0}
                            />
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-6 bg-blue-50/50 rounded-2xl border-2 border-blue-200 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-lg">Promedio Total:</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl font-extrabold ${getNivelDesempeño(getPromedios.pTotal).color}`}>
                      {getPromedios.pTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm text-gray-600">
                    Nivel de Desempeño: <span className={`text-2xl font-bold ${getNivelDesempeño(getPromedios.pTotal).color}`}>{getNivelDesempeño(getPromedios.pTotal).texto}</span>
                  </p>
                </div>
              </div>
            </div>

            <OptimizedTextarea
              label="Necesidades de Capacitación y/o Entrenamiento"
              value={formData.necesidadesCapacitacion || ""}
              onValueChange={(val) => handleTextareaChange('necesidadesCapacitacion', val)}
              placeholder="Describa las necesidades de capacitación..."
              labelClassName="text-xl font-bold text-gray-900 mb-3"
              className="block w-full border-2 border-blue-200 rounded-xl p-4 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm resize-none"
              rows={5}
            />

            <OptimizedTextarea
              label="Compromisos del Trabajador"
              value={formData.compromisosTrabajador || ""}
              onValueChange={(val) => handleTextareaChange('compromisosTrabajador', val)}
              placeholder="Describa los compromisos acordados..."
              labelClassName="text-xl font-bold text-gray-900 mb-3"
              className="block w-full border-2 border-blue-200 rounded-xl p-4 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm resize-none"
              rows={5}
            />

            <div className="flex justify-end pt-6 border-t-2 border-blue-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-3 brand-bg brand-bg-hover text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                <span>{loading ? "Guardando..." : "Guardar Evaluación"}</span>
              </button>
            </div>
          </motion.div>
        </form>
      )}
    </div>
  );
}
