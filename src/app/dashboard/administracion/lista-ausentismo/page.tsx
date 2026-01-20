'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, AlertCircle } from "lucide-react";
import { MOCK_AUSENTISMOS } from "@/modules/administracion/constants";

export default function ListaAusentismoPage() {
  const ausentismosHoy = useMemo(() => {
    const hoy = new Date().toISOString().split("T")[0];
    return MOCK_AUSENTISMOS.filter((ausentismo) => ausentismo.fechaInicio === hoy);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-amber-500 tracking-tight">Lista Ausentismo</h1>
        <p className="text-gray-500 mt-1">Ausentismos del día actual</p>
      </div>

      {ausentismosHoy.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
        >
          <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay ausentismos registrados para hoy</h3>
          <p className="text-gray-600">No se encontraron ausentismos para la fecha actual</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ausentismosHoy.map((ausentismo, index) => (
            <motion.div
              key={ausentismo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <User className="text-rose-600" size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ausentismo.estado === "Aprobado" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {ausentismo.estado}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{ausentismo.colaborador}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>Hora inicio: {ausentismo.horaInicio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>Hora fin: {ausentismo.horaFin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{ausentismo.area} - {ausentismo.sede}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="font-medium text-gray-900">Motivo:</p>
                  <p className="text-gray-700">{ausentismo.motivo || ausentismo.detalle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

