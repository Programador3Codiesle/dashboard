'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp } from 'lucide-react';
import { HorasExtrasCard } from '@/components/administracion/cards/HorasExtrasCard';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { listaHorasExtrasService } from '@/modules/administracion/services/lista-horas-extras.service';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import { LISTA_HORAS_EXTRAS_SUBMENU_ID } from '@/utils/constants';

export function ListaHorasExtrasGestion() {
  const { user, blocked } = useAdministracionPageGuard(
    LISTA_HORAS_EXTRAS_SUBMENU_ID,
  );
  const sesionLista = !!user && !blocked;

  const query = useQuery({
    queryKey: administracionKeys.listaHorasExtras,
    queryFn: () => listaHorasExtrasService.obtenerDiaActual(),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  if (blocked) return null;

  const rows = query.data ?? [];

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.listaHorasExtras.title}
      description={ADMINISTRACION_COPY.listaHorasExtras.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.listaHorasExtras.loadError,
          )}
        />
      ) : null}

      {query.isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={24} />
            <span>Cargando horas extras...</span>
          </div>
        </div>
      ) : rows.length === 0 && !query.isError ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg">
          <TrendingUp className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {ADMINISTRACION_COPY.listaHorasExtras.empty}
          </h3>
          <p className="text-gray-600">
            No se encontraron horas extras para la fecha actual
          </p>
        </div>
      ) : (
        <div className="app-kpi-grid-3">
          {rows.map((tiempo, index) => (
            <motion.div
              key={tiempo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <HorasExtrasCard horasExtras={tiempo} index={index} />
            </motion.div>
          ))}
        </div>
      )}
    </AdministracionPageFrame>
  );
}
