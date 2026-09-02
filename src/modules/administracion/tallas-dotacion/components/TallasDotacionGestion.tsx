'use client';

import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, User } from 'lucide-react';
import { TallaDotacionForm } from '@/components/administracion/forms/TallaDotacionForm';
import { useToast } from '@/components/shared/ui/ToastContext';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { tallasDotacionService } from '@/modules/administracion/services/tallas-dotacion.service';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import type { ActualizarTallaDotacionDTO } from '@/modules/administracion/types';
import { TALLAS_DOTACION_SUBMENU_ID } from '@/utils/constants';

function snapshotForm(
  emp: number,
  datos?: {
    genero: string;
    tallaCamisa: string;
    tallaPantalon: string;
    tallaBotas: string;
  } | null,
): ActualizarTallaDotacionDTO {
  return {
    genero:
      datos?.genero === '0' || datos?.genero === '1' ? datos.genero : '',
    tallaCamisa: datos?.tallaCamisa || '',
    tallaPantalon: datos?.tallaPantalon || '',
    tallaBotas: datos?.tallaBotas || '',
    id_empresa: emp,
  };
}

export function TallasDotacionGestion() {
  const { user, blocked } = useAdministracionPageGuard(
    TALLAS_DOTACION_SUBMENU_ID,
  );
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const emp = user?.empresa ?? 1;
  const sesionLista = !!user && !blocked;
  const [draft, setDraft] = useState<ActualizarTallaDotacionDTO | null>(null);

  const query = useQuery({
    queryKey: administracionKeys.tallasDotacion(emp),
    queryFn: () => tallasDotacionService.obtenerTallas(emp),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const formData = draft ?? snapshotForm(emp, query.data);
  const tallasActuales = query.data ?? null;

  const saveMutation = useMutation({
    mutationFn: (payload: ActualizarTallaDotacionDTO) =>
      tallasDotacionService.actualizarTallas(payload),
    onSuccess: async () => {
      setDraft(null);
      await queryClient.invalidateQueries({
        queryKey: administracionKeys.tallasDotacion(emp),
      });
      showSuccess('Tallas actualizadas correctamente');
    },
    onError: () => {
      showError('Error al actualizar las tallas');
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      saveMutation.mutate({
        ...formData,
        id_empresa: formData.id_empresa ?? emp,
      });
    },
    [formData, emp, saveMutation],
  );

  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.tallasDotacion.title}
      description={ADMINISTRACION_COPY.tallasDotacion.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.tallasDotacion.loadError,
          )}
        />
      ) : null}

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-lg sm:p-4 md:p-6">
        <div className="mb-6 rounded-xl bg-linear-to-br from-[var(--color-primary-light)] to-white p-3 sm:p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full brand-bg">
              <User className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Actualización de tallas para{' '}
                {user?.nombre_usuario || user?.user || 'USUARIO'}
              </h2>
              <p className="mt-1 text-gray-600">
                Aquí puedes actualizar la información de tallas. Selecciona las
                opciones correspondientes y luego haz clic en Guardar.
              </p>
            </div>
          </div>
        </div>

        {query.isLoading ? (
          <div className="mb-6 rounded-xl bg-gray-50 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={20} />
              <span>Cargando información...</span>
            </div>
          </div>
        ) : tallasActuales ? (
          <div className="mb-6 rounded-xl bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">
              Información de tallas actual
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3 lg:grid-cols-5">
              <div>
                <span className="text-gray-600">NIT:</span>
                <p className="font-medium text-gray-900">{tallasActuales.nit}</p>
              </div>
              <div>
                <span className="text-gray-600">Género:</span>
                <p className="font-medium text-gray-900">
                  {tallasActuales.genero === '1'
                    ? 'Hombre'
                    : tallasActuales.genero === '0'
                      ? 'Mujer'
                      : tallasActuales.genero || 'No definido'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Camisa:</span>
                <p className="font-medium text-gray-900">
                  {tallasActuales.tallaCamisa || 'No definido'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Pantalón:</span>
                <p className="font-medium text-gray-900">
                  {tallasActuales.tallaPantalon || 'No definido'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Última actualización:</span>
                <p className="font-medium text-gray-900">
                  {tallasActuales.ultimaActualizacion || 'Nunca'}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TallaDotacionForm
            formData={formData}
            onFormDataChange={setDraft}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 rounded-xl brand-bg px-6 py-3 font-medium text-white shadow-md transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={18} />
              <span>
                {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </AdministracionPageFrame>
  );
}
