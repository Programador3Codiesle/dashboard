'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import {
  formatoOrdenSalidaService,
  type CrearOrdenSalidaDTO,
} from '@/modules/administracion/services/formato-orden-salida.service';
import { useToast } from '@/components/shared/ui/ToastContext';
import { useSedesByEmpresa } from '@/modules/administracion/hooks/useSedesByEmpresa';
import { catalogQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY, labelSede } from '@/modules/administracion/constants';
import { JefeAutorizaCombobox } from '@/modules/administracion/formato-orden-salida/components/JefeAutorizaCombobox';
import {
  AREAS_FORMATO_ORDEN_SALIDA,
  FORMATO_OS_ACCESS_NITS,
  comboJefesFormatoOrdenSalida,
} from '@/modules/administracion/formato-orden-salida/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import { FORMATO_ORDEN_SALIDA_SUBMENU_ID } from '@/utils/constants';

export function FormatoOrdenSalidaGestion() {
  const { user, blocked } = useAdministracionPageGuard(
    FORMATO_ORDEN_SALIDA_SUBMENU_ID,
    { allowedNits: FORMATO_OS_ACCESS_NITS },
  );
  const sesionLista = !!user && !blocked;
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const sedes = useSedesByEmpresa();
  const nitUsuario =
    user?.nit_usuario != null ? Number(user.nit_usuario) : Number.NaN;
  const jefes = useMemo(() => {
    if (!sesionLista || !Number.isFinite(nitUsuario)) return [];
    const nombre =
      user?.nombre_usuario?.trim() ||
      user?.name?.trim() ||
      String(nitUsuario);
    return comboJefesFormatoOrdenSalida(nitUsuario, nombre);
  }, [sesionLista, nitUsuario, user?.nombre_usuario, user?.name]);
  const { showError, showSuccess } = useToast();
  const [selectedJefeNit, setSelectedJefeNit] = useState<number | null>(null);
  const [jefeComboKey, setJefeComboKey] = useState(0);
  const jefeBuscable = jefes.length > 1;
  const [form, setForm] = useState<CrearOrdenSalidaDTO>({
    fecha_salida: today,
    area: '',
    sede: '',
    jefe: 0,
    tipoSalida: 0,
    quienSale: '',
    placa: '',
    conductor: '',
    explicacion: '',
    id_empresa: user?.empresa ?? 1,
  });

  const idEmpresa = user?.empresa ?? form.id_empresa;
  const sedeValue =
    sedes.length === 0
      ? form.sede
      : form.sede && sedes.includes(form.sede)
        ? form.sede
        : (sedes[0] ?? '');

  const tiposQuery = useQuery({
    queryKey: administracionKeys.formatoOrdenSalida(
      selectedJefeNit != null ? String(selectedJefeNit) : '',
      user?.empresa ?? 0,
    ),
    queryFn: () => formatoOrdenSalidaService.obtenerTiposSalida(selectedJefeNit!),
    enabled: sesionLista && selectedJefeNit != null && selectedJefeNit > 0,
    ...catalogQueryOptions,
  });

  const tiposSalida =
    selectedJefeNit != null ? (tiposQuery.data ?? []) : [];
  const loadingTipos = tiposQuery.isFetching;

  const showPlaca = useMemo(
    () => form.tipoSalida === 1 || form.tipoSalida === 15,
    [form.tipoSalida],
  );

  const showConductor = useMemo(
    () => [8, 10, 16, 18].includes(form.tipoSalida),
    [form.tipoSalida],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: CrearOrdenSalidaDTO) =>
      formatoOrdenSalidaService.crearOrdenSalida(payload),
    onSuccess: (result) => {
      if (!result.status) {
        showError(result.message || 'No se pudo guardar la orden de salida.');
        return;
      }
      showSuccess('Los datos se guardaron correctamente.');
      setForm({
        fecha_salida: today,
        area: '',
        sede: sedes[0] ?? '',
        jefe: 0,
        tipoSalida: 0,
        quienSale: '',
        placa: '',
        conductor: '',
        explicacion: '',
        id_empresa: idEmpresa,
      });
      setSelectedJefeNit(null);
      setJefeComboKey((key) => key + 1);
    },
    onError: () => {
      showError('Ha ocurrido un error al guardar la información.');
    },
  });

  const seleccionarJefe = (nit: number | null) => {
    if (nit == null || nit <= 0) {
      setSelectedJefeNit(null);
      setForm((prev) => ({ ...prev, jefe: 0, tipoSalida: 0 }));
      return;
    }
    setSelectedJefeNit(nit);
    setForm((prev) => ({ ...prev, jefe: nit, tipoSalida: 0 }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'tipoSalida' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.area ||
      !sedeValue ||
      !form.quienSale ||
      !form.explicacion ||
      !form.tipoSalida
    ) {
      showError('Por favor diligencia todos los campos obligatorios.');
      return;
    }

    if (!jefes.length || !selectedJefeNit) {
      showError('No hay jefes configurados para este usuario.');
      return;
    }

    if (showPlaca && !form.placa) {
      showError('La placa del vehículo es obligatoria para este tipo de salida.');
      return;
    }

    if (showConductor && !form.conductor) {
      showError('El conductor es obligatorio para este tipo de salida.');
      return;
    }

    saveMutation.mutate({
      ...form,
      sede: sedeValue,
      id_empresa: idEmpresa,
    });
  };

  if (blocked) return null;

  const submitting = saveMutation.isPending;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.formatoOrdenSalida.title}
      description={ADMINISTRACION_COPY.formatoOrdenSalida.description}
    >
      {tiposQuery.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            tiposQuery.error,
            ADMINISTRACION_COPY.formatoOrdenSalida.loadError,
          )}
        />
      ) : null}

      <div className="flex justify-end">
        <div className="text-right">
          <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Código del formato
          </p>
          <p className="text-sm font-bold text-gray-800">SGC-FR02</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-lg border border-gray-100/80 p-3 sm:p-4 md:p-6 md:p-8 space-y-8"
      >
        <div className="app-form-grid-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="fecha_salida"
              data-testid="adm-os-fecha"
              min={today}
              value={form.fecha_salida}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Área a la que se autoriza la salida
            </label>
            <select
              name="area"
              data-testid="adm-os-area"
              value={form.area}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
            >
              <option value="">Seleccione una opción</option>
              {AREAS_FORMATO_ORDEN_SALIDA.map((area) => (
                <option key={area.value} value={area.value}>
                  {area.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Sede
            </label>
            <select
              name="sede"
              data-testid="adm-os-sede"
              value={sedeValue}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
            >
              <option value="">Seleccione sede...</option>
              {sedes.map((sede) => (
                <option key={sede} value={sede}>
                  {labelSede(sede)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="app-filter-grid gap-6">
          <div>
            <label
              htmlFor="adm-os-jefe"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Jefe autoriza
            </label>
            {jefeBuscable ? (
              <JefeAutorizaCombobox
                key={jefeComboKey}
                id="adm-os-jefe"
                name="jefe"
                jefes={jefes}
                value={selectedJefeNit}
                onChange={seleccionarJefe}
                required
              />
            ) : (
              <select
                id="adm-os-jefe"
                name="jefe"
                data-testid="adm-os-jefe"
                value={selectedJefeNit ?? ''}
                onChange={(e) => {
                  const nit = Number(e.target.value);
                  seleccionarJefe(
                    Number.isFinite(nit) && nit > 0 ? nit : null,
                  );
                }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                required
              >
                <option value="">Seleccione una opción</option>
                {jefes.map((jefe) => (
                  <option key={jefe.nit} value={jefe.nit}>
                    {jefe.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tipo de salida
            </label>
            <div className="relative">
              <select
                name="tipoSalida"
                data-testid="adm-os-tipo"
                value={form.tipoSalida || ''}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                required
                disabled={loadingTipos || !selectedJefeNit}
              >
                <option value="">Seleccione una opción</option>
                {tiposSalida.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.descripcion}
                  </option>
                ))}
              </select>
              {loadingTipos && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Persona que saldrá
            </label>
            <input
              type="text"
              name="quienSale"
              value={form.quienSale}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              required
            />
          </div>

          {showPlaca && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Placa del vehículo
              </label>
              <input
                type="text"
                name="placa"
                value={form.placa ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    placa: e.target.value.toUpperCase(),
                  }))
                }
                className="w-full border border-amber-300 bg-amber-50 rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              />
            </div>
          )}

          {showConductor && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Conductor
              </label>
              <input
                type="text"
                name="conductor"
                value={form.conductor ?? ''}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Explicación
          </label>
          <textarea
            name="explicacion"
            value={form.explicacion}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-200 rounded-2xl px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            required
          />
        </div>

        <div className="flex">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full sm:w-auto justify-center items-center px-8 py-2.5 rounded-full brand-btn text-sm font-semibold shadow-md hover:opacity-90 focus:outline-none brand-focus-ring disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar
          </button>
        </div>
      </motion.form>
    </AdministracionPageFrame>
  );
}
