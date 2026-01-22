'use client';

import { motion } from "framer-motion";
import { FileText, Download } from "lucide-react";

export default function InformeSostenibilidadPage() {
  const handleDownload = () => {
    // Simulación de descarga - luego se conectará a API
    console.log("Descargando informe de sostenibilidad 2024");
    // En producción: window.open('/api/informes/sostenibilidad-2024/download', '_blank');
  };

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileText className="text-emerald-600" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Informe de Sostenibilidad 2024</h2>
              <p className="text-sm text-gray-600">Documento oficial de sostenibilidad corporativa</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 brand-bg brand-bg-hover text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
          >
            <Download size={18} />
            <span>Descargar PDF</span>
          </button>
        </div>

        {/* Visor de PDF - En producción se usaría un componente de visor de PDF */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-gray-50 min-h-[600px] flex items-center justify-center">
          <div>
            <FileText className="text-gray-400 mx-auto mb-4" size={64} />
            <p className="text-gray-600 font-medium">Vista previa del informe de sostenibilidad 2024</p>
            <p className="text-sm text-gray-500 mt-2">El visor de PDF se cargará aquí</p>
            <button
              onClick={handleDownload}
              className="mt-4 brand-text brand-text-hover font-medium underline"
            >
              O hacer clic para descargar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

