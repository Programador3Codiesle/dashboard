'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { TiempoSuplementarioCalendarDay } from '@/components/administracion/calendar/TiempoSuplementarioCalendarDay';
import DetalleTiempoSuplementarioCalendarioModal from '@/components/administracion/modals/DetalleTiempoSuplementarioCalendarioModal';
import SolicitudTiempoSuplementarioModal from '@/components/administracion/modals/SolicitudTiempoSuplementarioModal';
import { useToast } from '@/components/shared/ui/ToastContext';
import { transactionalQueryOptions } from '@/core/query/catalog-query-options';
import { AdministracionPageFrame } from '@/modules/administracion/components/AdministracionPageFrame';
import { ADMINISTRACION_COPY } from '@/modules/administracion/constants';
import { AdministracionQueryError } from '@/modules/administracion/shared/components/AdministracionQueryError';
import { administracionKeys } from '@/modules/administracion/shared/constants/query-keys';
import { useAdministracionPageGuard } from '@/modules/administracion/shared/hooks/useAdministracionPageGuard';
import {
  solicitudTiempoSuplementarioService,
  type TiempoSuplementarioCalendario,
} from '@/modules/administracion/services/solicitud-tiempo-suplementario.service';
import { getErrorMessage } from '@/modules/administracion/shared/utils/parse-api-error';
import type { SolicitudTiempoSuplementarioDTO } from '@/modules/administracion/types';
import { SOLICITUD_TIEMPO_SUPLEMENTARIO_SUBMENU_ID } from '@/utils/constants';

const todayDate = new Date();
const initialMes = todayDate.getMonth() + 1;
const initialAnio = todayDate.getFullYear();

export function SolicitudTiempoSuplementarioGestion() {
  const { user, blocked } = useAdministracionPageGuard(
    SOLICITUD_TIEMPO_SUPLEMENTARIO_SUBMENU_ID,
  );
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const sesionLista = !!user && !blocked;
  const [mesActual, setMesActual] = useState(initialMes);
  const [anioActual, setAnioActual] = useState(initialAnio);
  const [selectedDate, setSelectedDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalResetKey, setModalResetKey] = useState(0);
  const [detalleAbierto, setDetalleAbierto] =
    useState<TiempoSuplementarioCalendario | null>(null);

  const query = useQuery({
    queryKey: administracionKeys.solicitudTiempo(anioActual, mesActual),
    queryFn: () =>
      solicitudTiempoSuplementarioService.obtenerCalendario(
        mesActual,
        anioActual,
      ),
    enabled: sesionLista,
    ...transactionalQueryOptions,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: {
      fecha: string;
      horaInicio: string;
      horaFin: string;
      area: string;
      cargo: string;
      sede: string;
      descripcion: string;
      id_empresa: number;
      empleado?: number;
    }) => solicitudTiempoSuplementarioService.crearSolicitud(payload),
    onSuccess: async () => {
      showSuccess(
        'Solicitud de tiempo suplementario registrada correctamente',
      );
      setModalResetKey((k) => k + 1);
      await queryClient.invalidateQueries({
        queryKey: administracionKeys.solicitudTiempo(anioActual, mesActual),
      });
    },
    onError: () => {
      showError('Error al registrar la solicitud de tiempo suplementario');
    },
  });

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
    const todayStr = new Date().toISOString().split('T')[0];
    if (date >= todayStr) {
      setSelectedDate(date);
      setModalOpen(true);
    }
  }, []);

  const handleSave = async (data: SolicitudTiempoSuplementarioDTO) => {
    await saveMutation.mutateAsync({
      fecha: data.fechaInicio,
      horaInicio: data.horaInicio,
      horaFin: data.horaFin || '',
      area: data.area,
      cargo: data.cargo,
      sede: data.sede,
      descripcion: data.descripcionMotivo,
      id_empresa: data.id_empresa ?? user?.empresa ?? 1,
      empleado: data.empleado,
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const firstDay = new Date(anioActual, mesActual - 1, 1);
  const lastDay = new Date(anioActual, mesActual, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = useMemo(() => {
    const arr: (string | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) arr.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(
        `${anioActual}-${String(mesActual).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      );
    }
    return arr;
  }, [anioActual, mesActual, daysInMonth, startingDayOfWeek]);

  const tiemposSuplementarios = useMemo(
    () => query.data ?? [],
    [query.data],
  );
  const getTiemposForDate = useCallback(
    (date: string) => tiemposSuplementarios.filter((t) => t.fecha === date),
    [tiemposSuplementarios],
  );

  const mesTitulo = useMemo(
    () =>
      new Date(anioActual, mesActual - 1, 1).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      }),
    [mesActual, anioActual],
  );

  if (blocked) return null;

  return (
    <AdministracionPageFrame
      title={ADMINISTRACION_COPY.solicitudTiempoSuplementario.title}
      description={ADMINISTRACION_COPY.solicitudTiempoSuplementario.description}
    >
      {query.isError ? (
        <AdministracionQueryError
          message={getErrorMessage(
            query.error,
            ADMINISTRACION_COPY.solicitudTiempoSuplementario.loadError,
          )}
        />
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-3 shadow-lg sm:p-4 md:p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={irMesAnterior}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
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
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        {query.isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2
              className="animate-spin text-[var(--color-primary)]"
              size={28}
            />
          </div>
        ) : null}

        <div className="mb-2 grid grid-cols-7 gap-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div
              key={day}
              className="py-2 text-center font-semibold text-gray-700"
            >
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
              onVerDetalle={setDetalleAbierto}
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
        saving={saveMutation.isPending}
      />
      <DetalleTiempoSuplementarioCalendarioModal
        open={detalleAbierto !== null}
        onClose={() => setDetalleAbierto(null)}
        item={detalleAbierto}
      />
    </AdministracionPageFrame>
  );
}
