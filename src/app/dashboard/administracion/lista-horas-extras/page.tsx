'use client';

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Loader2 } from "lucide-react";
import { listaHorasExtrasService, HorasExtrasDiaActual } from "@/modules/administracion/services/lista-horas-extras.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { HorasExtrasCard } from "@/components/administracion/cards/HorasExtrasCard";

export default function ListaHorasExtrasPage() {
  const { showError } = useToast();
  const [horasExtrasHoy, setHorasExtrasHoy] = useState<HorasExtrasDiaActual[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarHorasExtras = useCallback(async () => {
    setLoading(true);
    try {
      const datos = await listaHorasExtrasService.obtenerDiaActual();
      setHorasExtrasHoy(datos);
    } catch (error) {
      console.error("Error al cargar horas extras:", error);
      showError("Error al cargar las horas extras del día");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    cargarHorasExtras();
  }, [cargarHorasExtras]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Lista Horas Extras</h1>
        <p className="text-gray-500 mt-1">Horas extras del día actual</p>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={24} />
            <span>Cargando horas extras...</span>
          </div>
        </motion.div>
      ) : horasExtrasHoy.length === 0 ? (
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
            >
              <HorasExtrasCard horasExtras={tiempo} index={index} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

