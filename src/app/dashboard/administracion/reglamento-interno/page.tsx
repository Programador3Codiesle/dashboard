'use client';

import { motion } from "framer-motion";
import { BookOpen, ExternalLink } from "lucide-react";

/** PDF del Reglamento Interno (public/uploads/formatos/administracion) */
const PDF_REGLAMENTO_URL = encodeURI("/uploads/formatos/administracion/REGLAMENTO INTERNO DE TRABAJO CODIESEL 2025.pdf");

export default function ReglamentoInternoPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Reglamento Interno de Trabajo</h1>
        <p className="text-gray-500 mt-1">Consulta del reglamento interno de trabajo de la empresa</p>
      </div>

      {/* Contenedor del PDF */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 brand-bg rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold brand-text">Reglamento Interno de Trabajo Codiesel 2025</h2>
              <p className="text-sm text-gray-600">Documento oficial del reglamento interno</p>
            </div>
          </div>
          <a
            href={PDF_REGLAMENTO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <ExternalLink size={18} />
            <span>Abrir en nueva pestaña</span>
          </a>
        </div>

        {/* Visor de PDF embebido */}
        <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-100 min-h-[600px]">
          <iframe
            src={`${PDF_REGLAMENTO_URL}#view=FitH`}
            title="Reglamento Interno de Trabajo Codiesel 2025"
            className="w-full h-[calc(100vh-280px)] min-h-[600px]"
          />
        </div>
      </motion.div>
    </div>
  );
}

