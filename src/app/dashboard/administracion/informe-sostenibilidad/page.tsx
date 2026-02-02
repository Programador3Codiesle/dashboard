'use client';

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

/** Ruta del PDF en public (se sirve en /uploads/formatos/...) */
const PDF_INFORME_SOSTENIBILIDAD = "/uploads/formatos/INFORME DE SOSTENIBILIDAD CODIESEL 2024.pdf";

export default function InformeSostenibilidadPage() {
  const pdfUrl = encodeURI(PDF_INFORME_SOSTENIBILIDAD);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Informe de Sostenibilidad 2024</h1>
        <p className="text-gray-500 mt-1">Visualización del informe anual de sostenibilidad</p>
      </div>

      {/* Contenedor del PDF */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FileText className="text-emerald-600" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Informe de Sostenibilidad 2024</h2>
            <p className="text-sm text-gray-600">Documento oficial de sostenibilidad corporativa</p>
          </div>
        </div>

        {/* Visor de PDF integrado */}
        <div className="rounded-xl border border-gray-200 bg-gray-100 overflow-hidden min-h-[600px]">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            title="Informe de Sostenibilidad 2024"
            className="w-full h-[calc(100vh-280px)] min-h-[600px] border-0"
          />
          <p className="text-center text-sm text-gray-500 py-3 bg-white border-t border-gray-100">
            Si el PDF no se muestra,{" "}
            <a
              href={pdfUrl}
              download="INFORME DE SOSTENIBILIDAD CODIESEL 2024.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="brand-text brand-text-hover font-medium underline"
            >
              descárgalo aquí
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

