'use client';

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { listaAusentismoService, AusentismoDiaActual } from "@/modules/administracion/services/lista-ausentismo.service";
import { useToast } from "@/components/shared/ui/ToastContext";
import { AusentismoCard } from "@/components/administracion/cards/AusentismoCard";

export default function ListaAusentismoPage() {
  const { showError } = useToast();
  const [ausentismosHoy, setAusentismosHoy] = useState<AusentismoDiaActual[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarAusentismos = useCallback(async () => {
    setLoading(true);
    try {
      const datos = await listaAusentismoService.obtenerDiaActual();
      setAusentismosHoy(datos);
    } catch (error) {
      console.error("Error al cargar ausentismos:", error);
      showError("Error al cargar los ausentismos del día");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    cargarAusentismos();
  }, [cargarAusentismos]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Lista Ausentismo</h1>
        <p className="text-gray-500 mt-1">Ausentismos del día actual</p>
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin" size={24} />
            <span>Cargando ausentismos...</span>
          </div>
        </motion.div>
      ) : ausentismosHoy.length === 0 ? (
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
            >
              <AusentismoCard ausentismo={ausentismo} index={index} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

