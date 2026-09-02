'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, FileText, X } from 'lucide-react';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import {
  ADMINISTRACION_COPY,
  FORMATOS_NOMINA,
} from '@/modules/administracion/constants';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { FORMATOS_NOMINA_SUBMENU_ID } from '@/utils/constants';

type Formato = (typeof FORMATOS_NOMINA)[number];

function buildUrl(file: string) {
  return `/uploads/formatos/administracion/${encodeURIComponent(file)}`;
}

export function FormatosNominaGestion() {
  const { blocked } = useAdministracionPageGuard(FORMATOS_NOMINA_SUBMENU_ID);
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<Formato | null>(
    null,
  );

  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.formatosNomina.title}
      description={ADMINISTRACION_COPY.formatosNomina.description}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-gray-100/80 bg-white p-3 shadow-lg sm:p-4 md:p-6 md:p-8"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FORMATOS_NOMINA.map((formato) => {
            const url = buildUrl(formato.file);
            return (
              <div
                key={formato.id}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-linear-to-b from-gray-50 to-white p-5 shadow-sm transition-all duration-200 hover:shadow-xl"
              >
                <div className="mb-4 flex items-start gap-4">
                  <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] p-3">
                    <FileText className="h-6 w-6 brand-text" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 transition-colors group-hover:brand-text md:text-base">
                      {formato.titulo}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 md:text-sm">
                      {formato.descripcion}
                    </p>
                  </div>
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormatoSeleccionado(formato)}
                    className="inline-flex items-center rounded-full brand-bg px-3 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 md:text-sm"
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    Visualizar
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 md:text-sm"
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    Descargar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {formatoSeleccionado ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl border border-gray-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 md:px-6">
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Previsualización de formato
                </p>
                <h2 className="text-sm font-semibold text-gray-900 md:text-base">
                  {formatoSeleccionado.titulo}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFormatoSeleccionado(null)}
                className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={buildUrl(formatoSeleccionado.file)}
                className="h-[70vh] w-full"
                style={{ border: 'none' }}
                title={formatoSeleccionado.titulo}
              />
            </div>
          </div>
        </div>
      ) : null}
    </AdministracionPageFrame>
  );
}
