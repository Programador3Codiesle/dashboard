'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import {
  ADMINISTRACION_COPY,
  administracionPdfSrc,
  PDF_INFORME_SOSTENIBILIDAD,
} from '@/modules/administracion/constants';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import { INFORME_SOSTENIBILIDAD_SUBMENU_ID } from '@/utils/constants';

export function InformeSostenibilidadGestion() {
  const { blocked } = useAdministracionPageGuard(
    INFORME_SOSTENIBILIDAD_SUBMENU_ID,
  );
  if (blocked) return null;

  const pdfUrl = administracionPdfSrc(PDF_INFORME_SOSTENIBILIDAD);

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.informeSostenibilidad.title}
      description={ADMINISTRACION_COPY.informeSostenibilidad.description}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-3 shadow-lg sm:p-4 md:p-6"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-success-soft)]">
            <FileText className="text-[var(--color-success)]" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Informe de Sostenibilidad 2024
            </h2>
            <p className="text-sm text-gray-600">
              Documento oficial de sostenibilidad corporativa
            </p>
          </div>
        </div>
        <div className="min-h-[600px] overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            title="Informe de Sostenibilidad 2024"
            className="h-[calc(100vh-280px)] min-h-[600px] w-full border-0"
          />
          <p className="border-t border-gray-100 bg-white py-3 text-center text-sm text-gray-500">
            Si el PDF no se muestra,{' '}
            <a
              href={pdfUrl}
              download="INFORME DE SOSTENIBILIDAD CODIESEL 2024.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium brand-text underline"
            >
              descárgalo aquí
            </a>
          </p>
        </div>
      </motion.div>
    </AdministracionPageFrame>
  );
}
