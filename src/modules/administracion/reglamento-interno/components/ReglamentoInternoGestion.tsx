'use client';

import { motion } from 'framer-motion';
import { BookOpen, ExternalLink } from 'lucide-react';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import {
  ADMINISTRACION_COPY,
  administracionPdfSrc,
  PDF_REGLAMENTO_INTERNO,
} from '@/modules/administracion/constants';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { REGLAMENTO_INTERNO_SUBMENU_ID } from '@/utils/constants';

const pdfUrl = administracionPdfSrc(PDF_REGLAMENTO_INTERNO);

export function ReglamentoInternoGestion() {
  const { blocked } = useAdministracionPageGuard(REGLAMENTO_INTERNO_SUBMENU_ID);
  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.reglamentoInterno.title}
      description={ADMINISTRACION_COPY.reglamentoInterno.description}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-3 shadow-lg sm:p-4 md:p-6"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl brand-bg">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold brand-text">
                Reglamento Interno de Trabajo Codiesel 2025
              </h2>
              <p className="text-sm text-gray-600">
                Documento oficial del reglamento interno
              </p>
            </div>
          </div>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl brand-bg px-4 py-2.5 font-medium text-white shadow-md transition-colors hover:opacity-90"
          >
            <ExternalLink size={18} />
            <span>Abrir en nueva pestaña</span>
          </a>
        </div>
        <div className="min-h-[600px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          <iframe
            src={`${pdfUrl}#view=FitH`}
            title="Reglamento Interno de Trabajo Codiesel 2025"
            className="h-[calc(100vh-280px)] min-h-[600px] w-full"
          />
        </div>
      </motion.div>
    </AdministracionPageFrame>
  );
}
