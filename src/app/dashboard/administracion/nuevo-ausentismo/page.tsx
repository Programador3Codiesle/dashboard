'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus } from "lucide-react";
import { NuevoAusentismoDTO, Ausentismo } from "@/modules/administracion/types";
import NuevoAusentismoModal from "@/components/administracion/modals/NuevoAusentismoModal";
import { useToast } from "@/components/shared/ui/ToastContext";

export default function NuevoAusentismoPage() {
  const { showSuccess } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [ausentismos, setAusentismos] = useState<Ausentismo[]>([]);

  const handleDateClick = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (date >= today) {
      setSelectedDate(date);
      setModalOpen(true);
    }
  };

  const handleSave = (data: NuevoAusentismoDTO) => {
    const nuevoAusentismo: Ausentismo = {
      id: ausentismos.length + 1,
      gestionadoPor: "Usuario Actual", // En producción vendría del auth
      colaborador: "Usuario Actual",
      sede: data.sede,
      area: data.area,
      fechaInicio: data.fecha,
      horaInicio: data.horaInicio,
      fechaFin: data.fecha,
      horaFin: data.horaFin,
      estado: "Pendiente",
      detalle: data.descripcionMotivo,
      motivo: data.motivo,
      cargo: data.cargo,
    };
    setAusentismos([...ausentismos, nuevoAusentismo]);
    showSuccess("Ausentismo registrado correctamente");
  };

  // Generar días del mes actual
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    days.push(dateStr);
  }

  const todayStr = today.toISOString().split("T")[0];

  const getAusentismosForDate = (date: string) => {
    return ausentismos.filter((a) => a.fechaInicio === date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-amber-500 tracking-tight">Nuevo Ausentismo</h1>
        <p className="text-gray-500 mt-1">Registra nuevos ausentismos seleccionando una fecha del calendario</p>
      </div>

      {/* Calendario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {new Date(today.getFullYear(), today.getMonth(), 1).toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </h2>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const ausentismosDate = getAusentismosForDate(date);
            const isPast = date < todayStr;
            const isToday = date === todayStr;

            return (
              <button
                key={date}
                onClick={() => handleDateClick(date)}
                disabled={isPast}
                className={`
                  aspect-square p-2 rounded-xl border-2 transition-all
                  ${isPast 
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-white border-gray-200 hover:border-amber-500 hover:bg-amber-50 cursor-pointer"
                  }
                  ${isToday ? "ring-2 ring-amber-500 border-amber-500" : ""}
                  ${ausentismosDate.length > 0 ? "bg-blue-50 border-blue-300" : ""}
                `}
              >
                <div className="text-sm font-medium">{date.split("-")[2]}</div>
                {ausentismosDate.length > 0 && (
                  <div className="mt-1 text-xs text-blue-600 font-medium">
                    {ausentismosDate[0].horaInicio} - {ausentismosDate[0].motivo}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      <NuevoAusentismoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        fechaSeleccionada={selectedDate}
      />
    </div>
  );
}

