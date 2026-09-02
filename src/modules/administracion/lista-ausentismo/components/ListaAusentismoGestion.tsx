'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AusentismoCard } from '@/components/administracion/cards/AusentismoCard';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { listaAusentismoService } from '@/modules/administracion/services/lista-ausentismo.service';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import { LISTA_AUSENTISMO_SUBMENU_ID } from '@/utils/constants';

export function ListaAusentismoGestion() {
  const { user, blocked } = useAdministracionPageGuard(
    LISTA_AUSENTISMO_SUBMENU_ID,
  );
  const sesionLista = !!user && !blocked;

  const query = useQuery({
    queryKey: administracionKeys.listaAusentismo,
    queryFn: () => listaAusentismoService.obtenerDiaActual(),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  if (blocked) return null;

  const rows = query.data ?? [];

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.listaAusentismo.title}
      description={ADMINISTRACION_COPY.listaAusentismo.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.listaAusentismo.loadError,
          )}
        />
      ) : null}

      {query.isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={24} />
            <span>Cargando ausentismos...</span>
          </div>
        </div>
      ) : rows.length === 0 && !query.isError ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-lg">
          <AlertCircle className="mx-auto mb-4 brand-text" size={48} />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {ADMINISTRACION_COPY.listaAusentismo.empty}
          </h3>
          <p className="text-gray-600">
            No se encontraron ausentismos para la fecha actual
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((ausentismo, index) => (
            <motion.div
              key={ausentismo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AusentismoCard ausentismo={ausentismo} index={index} />
            </motion.div>
          ))}
        </div>
      )}
    </AdministracionPageFrame>
  );
}
