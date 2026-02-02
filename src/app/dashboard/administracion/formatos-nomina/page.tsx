'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Eye, Download, X } from "lucide-react";

const FORMATOS = [
  {
    id: 1,
    titulo: "Descuento de nómina Codiesel",
    descripcion: "Formato para solicitar descuento de nómina para colaboradores de Codiesel.",
    file: "Descuento de nomina Codiesel.pdf",
  },
  {
    id: 2,
    titulo: "Descuento de nómina Gente Util",
    descripcion: "Formato de descuento de nómina para personal Gente Util.",
    file: "Descuento de nomina Gente Util.pdf",
  },
  {
    id: 3,
    titulo: "Formato solicitud de vacaciones",
    descripcion: "Solicitud de vacaciones de acuerdo con la política interna.",
    file: "Formato de Solicitud de Vacaciones.pdf",
  },
  {
    id: 4,
    titulo: "Formato solicitud de vacaciones en dinero",
    descripcion: "Solicitud de vacaciones en dinero según la normatividad vigente.",
    file: "Formato solicitud de vacaciones en dinero.pdf",
  },
  {
    id: 5,
    titulo: "Fechas de entrega de solicitud de vacaciones vs fecha de pago",
    descripcion: "Calendario de entrega de solicitudes de vacaciones y fechas de pago.",
    file: "Fechas de entrega de solicitud de vacaciones vs fecha de pago.pdf",
  },
];

export default function FormatosNominaPage() {
  const [formatoSeleccionado, setFormatoSeleccionado] = useState<(typeof FORMATOS)[number] | null>(null);

  const buildUrl = (file: string) =>
    `/uploads/formatos/administracion/${encodeURIComponent(file)}`;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold brand-text tracking-tight">
            Formatos Nómina
          </h1>
          <p className="text-gray-500 mt-1">
            Consulta, visualiza y descarga los formatos de nómina vigentes.
          </p>
        </div>
      </div>

      {/* Grid de formatos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100/80 p-6 md:p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FORMATOS.map((formato) => {
            const url = buildUrl(formato.file);
            return (
              <div
                key={formato.id}
                className="group bg-linear-to-b from-gray-50 to-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="rounded-xl bg-brand-50 p-3 shadow-inner">
                    <FileText className="w-6 h-6 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors text-sm md:text-base">
                      {formato.titulo}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      {formato.descripcion}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFormatoSeleccionado(formato)}
                    className="inline-flex items-center px-3 py-2 rounded-full text-xs md:text-sm font-semibold brand-btn shadow-sm hover:opacity-90 focus:outline-none brand-focus-ring transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1.5" />
                    Visualizar
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 rounded-full text-xs md:text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Descargar
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Modal de previsualización */}
      {formatoSeleccionado && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-100">
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Previsualización de formato
                </p>
                <h2 className="text-sm md:text-base font-semibold text-gray-900">
                  {formatoSeleccionado.titulo}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFormatoSeleccionado(null)}
                className="inline-flex items-center justify-center rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={buildUrl(formatoSeleccionado.file)}
                className="w-full h-[70vh]"
                style={{ border: "none" }}
                title={formatoSeleccionado.titulo}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
