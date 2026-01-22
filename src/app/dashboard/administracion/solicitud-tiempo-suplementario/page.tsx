'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { SolicitudTiempoSuplementarioDTO, TiempoSuplementario } from "@/modules/administracion/types";
import SolicitudTiempoSuplementarioModal from "@/components/administracion/modals/SolicitudTiempoSuplementarioModal";
import { useToast } from "@/components/shared/ui/ToastContext";

export default function SolicitudTiempoSuplementarioPage() {
  const { showSuccess } = useToast();
  const [selectedDate, setSelectedDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [tiemposSuplementarios, setTiemposSuplementarios] = useState<TiempoSuplementario[]>([]);

  const handleDateClick = (date: string) => {
    const today = new Date().toISOString().split("T")[0];
    if (date >= today) {
      setSelectedDate(date);
      setModalOpen(true);
    }
  };

  const handleSave = (data: SolicitudTiempoSuplementarioDTO) => {
    const nuevoTiempo: TiempoSuplementario = {
      id: tiemposSuplementarios.length + 1,
      nombreJefe: "Usuario Actual", // En producción vendría del auth
      nombreEmpleado: data.empleado,
      sede: data.sede,
      area: data.area,
      cargo: data.cargo,
      fechaInicio: data.fechaInicio,
      horaInicio: data.horaInicio,
      fechaSolicitud: new Date().toISOString().split("T")[0],
      descripcion: data.descripcionMotivo,
      autorizacion: "Pendiente",
    };
    setTiemposSuplementarios([...tiemposSuplementarios, nuevoTiempo]);
    showSuccess("Solicitud de tiempo suplementario registrada correctamente");
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

  const getTiemposForDate = (date: string) => {
    return tiemposSuplementarios.filter((t) => t.fechaInicio === date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Solicitud Tiempo Suplementario</h1>
        <p className="text-gray-500 mt-1">Solicita tiempo suplementario seleccionando una fecha del calendario</p>
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

            const tiemposDate = getTiemposForDate(date);
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
                    : "bg-white border-gray-200 hover:border-[var(--color-primary)] hover:brand-bg-light cursor-pointer"
                  }
                  ${isToday ? "ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]" : ""}
                  ${tiemposDate.length > 0 ? "bg-purple-50 border-purple-300" : ""}
                `}
              >
                <div className="text-sm font-medium">{date.split("-")[2]}</div>
                {tiemposDate.length > 0 && (
                  <div className="mt-1 text-xs text-purple-600 font-medium">
                    {tiemposDate[0].horaInicio} - {tiemposDate[0].nombreEmpleado}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      <SolicitudTiempoSuplementarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        fechaSeleccionada={selectedDate}
      />
    </div>
  );
}

