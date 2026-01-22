'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, User, Calendar } from "lucide-react";
import { MOCK_TIEMPO_SUPLEMENTARIO } from "@/modules/administracion/constants";

export default function ListaHorasExtrasPage() {
  const horasExtrasHoy = useMemo(() => {
    const hoy = new Date().toISOString().split("T")[0];
    return MOCK_TIEMPO_SUPLEMENTARIO.filter((tiempo) => tiempo.fechaInicio === hoy);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Lista Horas Extras</h1>
        <p className="text-gray-500 mt-1">Horas extras del día actual</p>
      </div>

      {horasExtrasHoy.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
        >
          <TrendingUp className="text-gray-400 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay horas extras registradas para hoy</h3>
          <p className="text-gray-600">No se encontraron horas extras para la fecha actual</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {horasExtrasHoy.map((tiempo, index) => (
            <motion.div
              key={tiempo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-teal-600" size={24} />
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {tiempo.autorizacion}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{tiempo.nombreEmpleado}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span>Jefe: {tiempo.nombreJefe}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span>Hora inicio: {tiempo.horaInicio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>{tiempo.area} - {tiempo.sede}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="font-medium text-gray-900">Descripción:</p>
                  <p className="text-gray-700">{tiempo.descripcion}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

