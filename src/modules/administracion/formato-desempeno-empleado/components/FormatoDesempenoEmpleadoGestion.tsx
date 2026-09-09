'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { useToast } from '@/components/shared/ui/ToastContext';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import {
  ADMINISTRACION_COPY,
  COMPETENCIAS_TEMPLATE,
} from '@/modules/administracion/constants';
import { useSedesByEmpresa } from '@/modules/administracion/hooks/useSedesByEmpresa';
import { formatoDesempenoService } from '@/modules/administracion/services/formato-desempeno.service';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import type {
  EvaluacionDesempeño,
  FormatoDesempenoAPI,
  FormatoDesempenoDTO,
  EscalaDesempeño,
  Competencia,
} from '@/modules/administracion/types';
import { FORMATO_DESEMPENO_EMPLEADO_SUBMENU_ID } from '@/utils/constants';

const MAPEO_COMPETENCIAS: string[] = [
  'trabajo_equipo_e',
  'part_activa_e',
  'prop_iniciativas_e',
  'rel_interpersonales_e',
  'comunicacion_efect_e',
  'discrecion_e',
  'responsabilidad_e',
  'acatamiento_e',
  'compromiso_e',
  'conocimiento_pro_e',
  'conocimiento_metas_e',
  'adaptabilidad_e',
  'control_estres_e',
  'solu_conflictos_e',
  'estrategia_e',
  'solu_adecuadas_e',
  'ident_cliente_e',
  'serv_cliente_e',
  'part_capacitacion_e',
  'info_peligros_e',
  'info_accidentes_e',
  'info_salud_e',
  'uso_epp_e',
  'llamados_aten_e',
  'accidentes_e',
];

function buildEmptyForm(nombreEmpleado: string): EvaluacionDesempeño {
  return {
    nombreEmpleado,
    area: '',
    cargo: '',
    sede: '',
    fecha: new Date().toISOString().split('T')[0],
    competencias: COMPETENCIAS_TEMPLATE.flatMap((categoria, catIdx) =>
      categoria.items.map((item, itemIdx) => ({
        id: `${catIdx}-${itemIdx}`,
        categoria: categoria.categoria,
        descripcion: item,
        autoEvaluacion: undefined,
      })),
    ),
    necesidadesCapacitacion: '',
    compromisosTrabajador: '',
    esAutoEvaluacion: true,
  };
}

function formFromApi(evaluacion: FormatoDesempenoAPI): EvaluacionDesempeño {
  const competenciasFlat = COMPETENCIAS_TEMPLATE.flatMap(
    (categoria) => categoria.items,
  );
  const competenciasMapeadas = competenciasFlat.map((descripcion, idx) => {
    const campo = MAPEO_COMPETENCIAS[idx] as keyof FormatoDesempenoAPI;
    const valor = evaluacion[campo] as number | undefined;
    const categoriaObj = COMPETENCIAS_TEMPLATE.find((cat) =>
      cat.items.includes(descripcion),
    );

    return {
      id: `${idx}`,
      categoria: categoriaObj?.categoria || '',
      descripcion,
      autoEvaluacion: valor as EscalaDesempeño | undefined,
    };
  });

  return {
    nombreEmpleado: evaluacion.empleado,
    area: evaluacion.area,
    cargo: evaluacion.cargo,
    sede: evaluacion.sede,
    fecha: evaluacion.fecha,
    competencias: competenciasMapeadas,
    necesidadesCapacitacion: evaluacion.capacidades_entrenamiento || '',
    compromisosTrabajador: evaluacion.compromisos || '',
    esAutoEvaluacion: true,
  };
}

const CompetenciaRow = React.memo(function CompetenciaRow({
  competencia,
  onValueChange,
  isEven,
}: {
  competencia: Competencia;
  onValueChange: (id: string, value: number) => void;
  isEven: boolean;
}) {
  return (
    <tr
      className={`border-b border-blue-50 transition-colors ${isEven ? 'bg-white' : 'bg-blue-50/30'} hover:brand-bg-light`}
    >
      <td className="py-4 px-6 text-sm text-gray-700 leading-relaxed">
        {competencia.descripcion}
      </td>
      <td className="py-4 px-6 text-center">
        <select
          className="border-2 border-blue-300 rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all bg-white hover:border-blue-400 shadow-sm w-20 text-center"
          value={competencia.autoEvaluacion || ''}
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

const InfoGeneral = React.memo(function InfoGeneral({
  formData,
  onFieldChange,
  sedes,
}: {
  formData: EvaluacionDesempeño;
  onFieldChange: (field: string, value: string) => void;
  sedes: string[];
}) {
  return (
    <div className="border-b-2 border-blue-100 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 brand-bg rounded-xl flex items-center justify-center shadow-md">
          <Save className="text-white" size={20} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Información General</h2>
      </div>
      <div className="app-form-grid-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre del Empleado a Valorar <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm"
            value={formData.nombreEmpleado}
            onChange={(e) => onFieldChange('nombreEmpleado', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Área <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm"
            value={formData.area}
            onChange={(e) => onFieldChange('area', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cargo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm"
            value={formData.cargo}
            onChange={(e) => onFieldChange('cargo', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sede <span className="text-red-500">*</span>
          </label>
          <select
            className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm appearance-none pr-10"
            value={formData.sede}
            onChange={(e) => onFieldChange('sede', e.target.value)}
            required
          >
            <option value="">Seleccione sede...</option>
            {sedes.map((sede) => (
              <option key={sede} value={sede}>
                {sede}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="block w-full border-2 border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-blue-50/30 hover:bg-white hover:border-blue-300 shadow-sm"
            value={formData.fecha}
            onChange={(e) => onFieldChange('fecha', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
});

const EscalaEvaluacion = React.memo(function EscalaEvaluacion() {
  return (
    <div className="bg-blue-50/50 border-2 border-blue-200 rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
        <span className="w-2 h-2 brand-bg rounded-full"></span>
        Escala de Evaluación
      </h3>
      <div className="app-filter-grid-5 text-sm">
        <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
          <span className="font-bold text-green-700">Sobresaliente (5):</span>
          <p className="text-gray-600 text-xs mt-2 leading-relaxed">
            Desempeño que consistentemente excede las expectativas
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
          <span className="font-bold text-blue-700">Bueno (4):</span>
          <p className="text-gray-600 text-xs mt-2 leading-relaxed">
            Desempeño que cumple con las expectativas
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
          <span className="font-bold brand-text">Satisfactorio (3):</span>
          <p className="text-gray-600 text-xs mt-2 leading-relaxed">
            Cumple pero presenta algunas inconsistencias
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
          <span className="font-bold text-orange-600">Regular (2):</span>
          <p className="text-gray-600 text-xs mt-2 leading-relaxed">
            Por debajo de lo esperado
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
          <span className="font-bold text-red-600">No satisfactorio (1):</span>
          <p className="text-gray-600 text-xs mt-2 leading-relaxed">
            Muy inferior a lo esperado
          </p>
        </div>
      </div>
    </div>
  );
});

export function FormatoDesempenoEmpleadoGestion() {
  const { user, blocked } = useAdministracionPageGuard(
    FORMATO_DESEMPENO_EMPLEADO_SUBMENU_ID,
  );
  const sedes = useSedesByEmpresa();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;
  const [draft, setDraft] = useState<EvaluacionDesempeño | null>(null);

  const query = useQuery({
    queryKey: administracionKeys.formatoDesempeno,
    queryFn: () => {
      const nit = user?.nit_usuario;
      if (nit == null) {
        throw new Error('No se pudo obtener la información del usuario');
      }
      return formatoDesempenoService.obtenerEvaluacion(nit);
    },
    enabled: sesionLista && !!user?.nit_usuario,
    ...transactionalQueryOptions,
  });

  const evaluacionExistente = query.data ?? null;
  const formData =
    draft ??
    (evaluacionExistente
      ? formFromApi(evaluacionExistente)
      : buildEmptyForm(user?.nombre_usuario || ''));

  const saveMutation = useMutation({
    mutationFn: (dto: FormatoDesempenoDTO) =>
      formatoDesempenoService.crearActualizarEvaluacion(dto),
    onSuccess: async () => {
      showSuccess('Autoevaluación guardada correctamente');
      await queryClient.invalidateQueries({
        queryKey: administracionKeys.formatoDesempeno,
      });
    },
    onError: (error: unknown) => {
      showError(getErrorMessage(error, 'Error al guardar la autoevaluación'));
    },
  });

  const patchForm = useCallback(
    (updater: (prev: EvaluacionDesempeño) => EvaluacionDesempeño) => {
      setDraft((prev) => {
        const base =
          prev ??
          (query.data
            ? formFromApi(query.data)
            : buildEmptyForm(user?.nombre_usuario || ''));
        return updater(base);
      });
    },
    [query.data, user?.nombre_usuario],
  );

  const handleFieldChange = useCallback(
    (field: string, value: string) => {
      patchForm((prev) => ({ ...prev, [field]: value }));
    },
    [patchForm],
  );

  const handleCompetenciaChange = useCallback(
    (id: string, value: number) => {
      patchForm((prev) => ({
        ...prev,
        competencias: prev.competencias.map((comp) =>
          comp.id === id
            ? { ...comp, autoEvaluacion: value as EscalaDesempeño }
            : comp,
        ),
      }));
    },
    [patchForm],
  );

  const mapearCompetenciasADTO = useCallback((): Partial<FormatoDesempenoDTO> => {
    const dto: Record<string, number> = {};
    formData.competencias.forEach((comp, idx) => {
      const campo = MAPEO_COMPETENCIAS[idx];
      if (campo && comp.autoEvaluacion !== undefined) {
        dto[campo] = comp.autoEvaluacion;
      }
    });
    return dto as Partial<FormatoDesempenoDTO>;
  }, [formData.competencias]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.nit_usuario || saveMutation.isPending) return;

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

    saveMutation.mutate(dto);
  };

  const promedios = useMemo(() => {
    const comps = formData.competencias.filter((c) => c.autoEvaluacion);
    if (comps.length === 0) return 0;
    return (
      comps.reduce((acc, c) => acc + (c.autoEvaluacion || 0), 0) / comps.length
    );
  }, [formData.competencias]);

  const getNivelDesempeño = useCallback((promedio: number) => {
    if (promedio >= 4.5) return { texto: 'Sobresaliente', color: 'text-green-600' };
    if (promedio >= 4.0) return { texto: 'Bueno', color: 'text-blue-600' };
    if (promedio >= 3.1) return { texto: 'Satisfactorio', color: 'text-yellow-600' };
    if (promedio >= 2.1) return { texto: 'Regular', color: 'text-orange-600' };
    return { texto: 'No satisfactorio', color: 'text-red-600' };
  }, []);

  if (blocked) return null;

  const loadingEvaluacion = !query.isSuccess && !query.isError;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.formatoDesempeno.title}
      description={ADMINISTRACION_COPY.formatoDesempeno.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.formatoDesempeno.loadError,
          )}
        />
      ) : null}

      {loadingEvaluacion ? (
        <div className="text-center py-10 text-gray-500">
          Cargando evaluación...
        </div>
      ) : (
        <>
          {evaluacionExistente ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              Se encontró una evaluación existente. Puede editarla y guardar los
              cambios.
            </div>
          ) : null}
          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200/50 p-3 sm:p-4 md:p-8 space-y-8"
            >
              <InfoGeneral
                formData={formData}
                onFieldChange={handleFieldChange}
                sedes={sedes}
              />
              <EscalaEvaluacion />

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Desempeño Laboral
                </h2>
                <div data-testid="adm-desempeno-table" className="app-table-scroll rounded-xl border-2 border-blue-200 shadow-sm">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="brand-bg border-b-2 border-[var(--color-primary)]">
                        <th className="text-left py-4 px-6 font-bold text-white">
                          Competencia
                        </th>
                        <th className="text-center py-4 px-6 font-bold text-white">
                          Auto Evaluación 30%
                        </th>
                        <th className="text-center py-4 px-6 font-bold text-white">
                          Jefe Inmediato 70%
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPETENCIAS_TEMPLATE.map((cat) => (
                        <React.Fragment key={cat.categoria}>
                          <tr className="bg-blue-100 border-y-2 border-blue-200">
                            <td
                              colSpan={3}
                              className="py-3 px-6 font-bold text-blue-900 text-base"
                            >
                              {cat.categoria}
                            </td>
                          </tr>
                          {formData.competencias
                            .filter((c) => c.categoria === cat.categoria)
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

                <div className="mt-6 p-3 sm:p-4 md:p-6 bg-blue-50/50 rounded-2xl border-2 border-blue-200 shadow-md">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                    <span className="font-bold text-gray-900 text-lg">
                      Promedio Auto Evaluación:
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-2xl sm:text-3xl font-extrabold ${getNivelDesempeño(promedios).color}`}
                      >
                        {promedios.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-gray-600">
                      Nivel de Desempeño:{' '}
                      <span
                        className={`text-2xl font-bold  ${getNivelDesempeño(promedios).color}`}
                      >
                        {getNivelDesempeño(promedios).texto}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex pt-6 border-t-2 border-blue-100">
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex w-full sm:w-auto justify-center items-center gap-3 brand-bg brand-bg-hover text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={20} />
                  <span>
                    {saveMutation.isPending
                      ? 'Guardando...'
                      : evaluacionExistente
                        ? 'Actualizar Autoevaluación'
                        : 'Guardar Autoevaluación'}
                  </span>
                </button>
              </div>
            </motion.div>
          </form>
        </>
      )}
    </AdministracionPageFrame>
  );
}
