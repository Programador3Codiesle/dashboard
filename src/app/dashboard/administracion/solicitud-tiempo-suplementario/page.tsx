'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { SolicitudTiempoSuplementarioDTO } from "@/modules/administracion/types";
import { solicitudTiempoSuplementarioService, TiempoSuplementarioCalendario } from "@/modules/administracion/services/solicitud-tiempo-suplementario.service";
import SolicitudTiempoSuplementarioModal from "@/components/administracion/modals/SolicitudTiempoSuplementarioModal";
import DetalleTiempoSuplementarioCalendarioModal from "@/components/administracion/modals/DetalleTiempoSuplementarioCalendarioModal";
import { useToast } from "@/components/shared/ui/ToastContext";
import { TiempoSuplementarioCalendarDay } from "@/components/administracion/calendar/TiempoSuplementarioCalendarDay";
import { useAuth } from "@/core/auth/hooks/useAuth";

const todayDate = new Date();
const initialMes = todayDate.getMonth() + 1;
const initialAnio = todayDate.getFullYear();

export default function SolicitudTiempoSuplementarioPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [mesActual, setMesActual] = useState(initialMes);
  const [anioActual, setAnioActual] = useState(initialAnio);
  const [selectedDate, setSelectedDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResetKey, setModalResetKey] = useState(0);
  const [detalleAbierto, setDetalleAbierto] = useState<TiempoSuplementarioCalendario | null>(null);
  const [tiemposSuplementarios, setTiemposSuplementarios] = useState<TiempoSuplementarioCalendario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const cargarTiemposSuplementarios = useCallback(async () => {
    setLoading(true);
    try {
      const datos = await solicitudTiempoSuplementarioService.obtenerCalendario(mesActual, anioActual);
      setTiemposSuplementarios(datos);
    } catch (error) {
      console.error("Error al cargar tiempos suplementarios:", error);
      showError("Error al cargar los tiempos suplementarios");
    } finally {
      setLoading(false);
    }
  }, [mesActual, anioActual, showError]);

  useEffect(() => {
    cargarTiemposSuplementarios();
  }, [cargarTiemposSuplementarios]);

  const irMesAnterior = useCallback(() => {
    if (mesActual === 1) {
      setMesActual(12);
      setAnioActual((a) => a - 1);
    } else {
      setMesActual((m) => m - 1);
    }
  }, [mesActual]);

  const irMesSiguiente = useCallback(() => {
    if (mesActual === 12) {
      setMesActual(1);
      setAnioActual((a) => a + 1);
    } else {
      setMesActual((m) => m + 1);
    }
  }, [mesActual]);

  const handleCrearClick = useCallback((date: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    if (date >= todayStr) {
      setSelectedDate(date);
      setModalOpen(true);
    }
  }, []);

  const handleVerDetalle = useCallback((item: TiempoSuplementarioCalendario) => {
    setDetalleAbierto(item);
  }, []);

  const handleSave = async (data: SolicitudTiempoSuplementarioDTO) => {
    setSaving(true);
    try {
      const payload = {
        fecha: data.fechaInicio,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin || "",
        area: data.area,
        cargo: data.cargo,
        sede: data.sede,
        descripcion: data.descripcionMotivo,
        id_empresa: data.id_empresa ?? user?.empresa ?? 1,
        empleado: data.empleado,
      };
      await solicitudTiempoSuplementarioService.crearSolicitud(payload);
      showSuccess("Solicitud de tiempo suplementario registrada correctamente");
      setModalResetKey((k) => k + 1);
      await cargarTiemposSuplementarios();
    } catch (error) {
      console.error("Error al crear solicitud:", error);
      showError("Error al registrar la solicitud de tiempo suplementario");
    } finally {
      setSaving(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const firstDay = new Date(anioActual, mesActual - 1, 1);
  const lastDay = new Date(anioActual, mesActual, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = useMemo(() => {
    const arr: (string | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(
        `${anioActual}-${String(mesActual).padStart(2, "0")}-${String(i).padStart(2, "0")}`
      );
    }
    return arr;
  }, [anioActual, mesActual, daysInMonth, startingDayOfWeek]);

  const getTiemposForDate = useCallback((date: string) => {
    return tiemposSuplementarios.filter((t) => t.fecha === date);
  }, [tiemposSuplementarios]);

  const mesTitulo = useMemo(
    () =>
      new Date(anioActual, mesActual - 1, 1).toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      }),
    [mesActual, anioActual]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold brand-text tracking-tight">Solicitud Tiempo Suplementario</h1>
        <p className="text-gray-500 mt-1">Solicita tiempo suplementario seleccionando una fecha del calendario</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={irMesAnterior}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 capitalize first-letter:uppercase">
            {mesTitulo}
          </h2>
          <button
            type="button"
            onClick={irMesSiguiente}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={28} />
          </div>
        )}

        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((date, index) => (
            <TiempoSuplementarioCalendarDay
              key={date || `empty-${index}`}
              date={date}
              todayStr={todayStr}
              tiempos={date ? getTiemposForDate(date) : []}
              onCrear={handleCrearClick}
              onVerDetalle={handleVerDetalle}
            />
          ))}
        </div>
      </motion.div>

      <SolicitudTiempoSuplementarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        fechaSeleccionada={selectedDate}
        resetKey={modalResetKey}
        saving={saving}
      />
      <DetalleTiempoSuplementarioCalendarioModal
        open={detalleAbierto !== null}
        onClose={() => setDetalleAbierto(null)}
        item={detalleAbierto}
      />
    </div>
  );
}
