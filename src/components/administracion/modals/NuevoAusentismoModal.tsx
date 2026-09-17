'use client';

import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/shared/ui/Modal";
import { HoraMilitarSelect } from "@/components/administracion/forms/HoraMilitarSelect";
import { useToast } from "@/components/shared/ui/ToastContext";
import { NuevoAusentismoDTO } from "@/modules/administracion/types";
import {
  AREAS_SOLICITA,
  MOTIVOS_PERMISO,
  MOTIVO_COMPENSATORIO_VENTAS,
  motivoRequiereAdjunto,
  labelSede,
} from "@/modules/administracion/constants";
import { useSedesByEmpresa } from "@/modules/administracion/hooks/useSedesByEmpresa";
import { ChevronDown, Loader2, Plus, Trash2 } from "lucide-react";
import { OptimizedInput } from "@/components/shared/ui/OptimizedInput";
import { OptimizedTextarea } from "@/components/shared/ui/OptimizedTextarea";
import { transactionalQueryOptions } from "@/core/query/catalog-query-options";
import { administracionKeys } from "@/modules/administracion/shared/constants/query-keys";
import { nuevoAusentismoService } from "@/modules/administracion/services/nuevo-ausentismo.service";
import { getErrorMessage } from "@/modules/administracion/shared/utils/parse-api-error";
import {
  OPCIONES_HORA_AUSENTISMO,
  diferenciaHorasDecimal,
  esMotivoRecuperacion,
  hayCruceTramosMismoDia,
  horaAMinutos,
  horasCoinciden,
  type TramoRecuperacion,
} from "@/modules/administracion/shared/utils/hora-militar";

interface NuevoAusentismoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NuevoAusentismoDTO) => void;
  fechaSeleccionada: string;
  resetKey?: number;
  saving?: boolean;
  perfilPostventa?: string | number;
}

const TRAMO_VACIO: TramoRecuperacion = { fecha: "", hora_ini: "", hora_fin: "" };

function hoyLocalYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NuevoAusentismoModal({
  open,
  onClose,
  onSave,
  fechaSeleccionada,
  resetKey = 0,
  saving = false,
  perfilPostventa,
}: NuevoAusentismoModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Nuevo Ausentismo" width="600px">
      <NuevoAusentismoForm
        key={`${fechaSeleccionada}-${resetKey}`}
        onClose={onClose}
        onSave={onSave}
        fechaSeleccionada={fechaSeleccionada}
        saving={saving}
        perfilPostventa={perfilPostventa}
      />
    </Modal>
  );
}

function NuevoAusentismoForm({
  onClose,
  onSave,
  fechaSeleccionada,
  saving = false,
  perfilPostventa,
}: {
  onClose: () => void;
  onSave: (data: NuevoAusentismoDTO) => void;
  fechaSeleccionada: string;
  saving?: boolean;
  perfilPostventa?: string | number;
}) {
  const sedes = useSedesByEmpresa();
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { showError } = useToast();
  const [formData, setFormData] = useState<NuevoAusentismoDTO>({
    fecha: fechaSeleccionada,
    horaInicio: "",
    horaFin: "",
    area: "",
    cargo: "",
    sede: "",
    motivo: "",
    descripcionMotivo: "",
  });
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tramos, setTramos] = useState<TramoRecuperacion[]>([{ ...TRAMO_VACIO }]);

  const motivos = useMemo(() => {
    const perfil = Number(perfilPostventa);
    if (perfil === 41 || perfil === 11) {
      return [...MOTIVOS_PERMISO, MOTIVO_COMPENSATORIO_VENTAS];
    }
    return MOTIVOS_PERMISO;
  }, [perfilPostventa]);

  const pideAdjunto = motivoRequiereAdjunto(formData.motivo);
  const horasAusentismo = diferenciaHorasDecimal(formData.horaInicio, formData.horaFin);
  const motivoRecuperacion = esMotivoRecuperacion(formData.motivo);
  const horasValidas =
    Number.isFinite(horasAusentismo) && horasAusentismo > 0;

  const tiempoQuery = useQuery({
    queryKey: administracionKeys.tiempoRestanteAusentismo(
      horasValidas ? horasAusentismo.toFixed(2) : "0",
    ),
    queryFn: () => nuevoAusentismoService.tiempoRestante(horasAusentismo),
    enabled: motivoRecuperacion && horasValidas,
    ...transactionalQueryOptions,
  });

  const requiereRecuperacion =
    motivoRecuperacion &&
    horasValidas &&
    (tiempoQuery.data?.requiereRecuperacion ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pideAdjunto && !archivo) return;
    const iniMin = horaAMinutos(formData.horaInicio);
    const finMin = horaAMinutos(formData.horaFin);
    if (iniMin == null || finMin == null || iniMin >= finMin) {
      showError(
        "Hora inicio ausentismo no puede ser mayor a la Hora En Que Termina El Ausentismo",
      );
      return;
    }
    const validos = tramos.filter((t) => t.fecha && t.hora_ini && t.hora_fin);
    if (requiereRecuperacion) {
      if (
        validos.length === 0 ||
        !horasCoinciden(formData.horaInicio, formData.horaFin, validos)
      ) {
        showError(
          "Por favor verifique que las horas del ausentismo y de recuperación sean las mismas",
        );
        return;
      }
      if (hayCruceTramosMismoDia(validos)) {
        showError("Los rangos de horas no deben cruzarse");
        return;
      }
    }
    onSave({
      ...formData,
      archivoSoporte: archivo ?? undefined,
      recuperacion: requiereRecuperacion
        ? validos.map((t) => ({
            fecha: t.fecha,
            horaInicio: t.hora_ini,
            horaFin: t.hora_fin,
          }))
        : undefined,
    });
  };

  const handleMotivoChange = (motivo: string) => {
    if (esMotivoRecuperacion(motivo) && (!formData.horaInicio || !formData.horaFin)) {
      showError("Debes llenar los campos de fecha y hora primero");
      setFormData({ ...formData, motivo: "" });
      return;
    }
    setFormData({ ...formData, motivo });
    if (!motivoRequiereAdjunto(motivo)) {
      setArchivo(null);
      if (fileRef.current) fileRef.current.value = "";
    }
    if (!esMotivoRecuperacion(motivo)) {
      setTramos([{ ...TRAMO_VACIO }]);
    }
  };

  const actualizarTramo = (index: number, patch: Partial<TramoRecuperacion>) => {
    setTramos((prev) => {
      const next = prev.map((t, i) => (i === index ? { ...t, ...patch } : t));
      const conHoras = next.filter((t) => t.fecha && t.hora_ini && t.hora_fin);
      if (conHoras.length >= 2 && hayCruceTramosMismoDia(conHoras)) {
        showError("Los rangos de horas no deben cruzarse");
        return next.map((t) => ({ ...t, hora_ini: "", hora_fin: "" }));
      }
      return next;
    });
  };

  const onFechaRecuperacion = async (index: number, fecha: string) => {
    actualizarTramo(index, { fecha });
    if (!fecha) return;
    try {
      const habil = await queryClient.fetchQuery({
        queryKey: administracionKeys.diaHabilAusentismo(fecha),
        queryFn: () => nuevoAusentismoService.esDiaHabil(fecha),
        staleTime: 5 * 60 * 1000,
      });
      if (!habil) {
        showError("La fecha seleccionada no es un día hábil");
        actualizarTramo(index, { fecha: "" });
      }
    } catch (error) {
      showError(getErrorMessage(error, "No se pudo validar el día hábil"));
      actualizarTramo(index, { fecha: "" });
    }
  };

  const inputClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white appearance-none pr-10";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const textareaClass = "block w-full border border-gray-300 rounded-xl p-2.5 focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all text-sm bg-white";
  const minFecha = hoyLocalYmd();

  return (
    <>
      <div className="mb-4 p-3 brand-bg-light border border-[var(--color-primary)] rounded-lg">
        <p className="text-sm text-[var(--color-primary-dark)]">
          Los ausentismos solo se podrán diligenciar máximo por un día. Si desea tomar más de un día debe hacerlo por separado.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        <div>
          <label className={labelClass} htmlFor="ausen-fecha">Fecha en la que se ausentará</label>
          <input
            id="ausen-fecha"
            type="date"
            className={inputClass.replace("appearance-none pr-10", "")}
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            required
            min={minFecha}
          />
        </div>

        <div className="app-form-grid-2">
          <div>
            <label className={labelClass} htmlFor="ausen-hora-ini">Hora Inicio Ausentismo <span className="text-red-500">*</span></label>
            <HoraMilitarSelect
              id="ausen-hora-ini"
              name="hora_ini"
              aria-label="Hora inicio ausentismo"
              className={inputClass}
              value={formData.horaInicio}
              onChange={(horaInicio) => setFormData({ ...formData, horaInicio })}
              opciones={OPCIONES_HORA_AUSENTISMO}
              required
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ausen-hora-fin">Hora En Que Termina El Ausentismo <span className="text-red-500">*</span></label>
            <HoraMilitarSelect
              id="ausen-hora-fin"
              name="hora_fin"
              aria-label="Hora en que termina el ausentismo"
              className={inputClass}
              value={formData.horaFin}
              onChange={(horaFin) => setFormData({ ...formData, horaFin })}
              opciones={OPCIONES_HORA_AUSENTISMO}
              required
            />
          </div>
        </div>

        <div className="app-form-grid-2">
          <div>
            <label className={labelClass}>Área donde labora <span className="text-red-500">*</span></label>
            <div className="relative mt-1">
              <select
                className={inputClass}
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                required
              >
                <option value="">Seleccione...</option>
                {AREAS_SOLICITA.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          <OptimizedInput
            label="Cargo del empleado"
            labelClassName={labelClass}
            className={inputClass.replace("appearance-none pr-10", "")}
            value={formData.cargo}
            onValueChange={(val) => setFormData({ ...formData, cargo: val })}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Sede <span className="text-red-500">*</span></label>
          <div className="relative mt-1">
            <select
              className={inputClass}
              value={formData.sede}
              onChange={(e) => setFormData({ ...formData, sede: e.target.value })}
              required
            >
              <option value="">Seleccione...</option>
              {sedes.map((sede) => (
                <option key={sede} value={sede}>{labelSede(sede)}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="ausen-motivo">Motivo del permiso <span className="text-red-500">*</span></label>
          <div className="relative mt-1">
            <select
              id="ausen-motivo"
              className={inputClass}
              value={formData.motivo}
              onChange={(e) => handleMotivoChange(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {motivos.map((motivo) => (
                <option key={motivo.value} value={motivo.value}>{motivo.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
          </div>
        </div>

        {motivoRecuperacion && tiempoQuery.isFetching ? (
          <p className="text-sm text-gray-600">Consultando chequera de tiempo...</p>
        ) : null}

        {motivoRecuperacion && horasValidas && tiempoQuery.data ? (
          <div className="rounded-lg border border-[var(--color-primary)] brand-bg-light p-3">
            <p className="text-sm text-[var(--color-primary-dark)]">{tiempoQuery.data.texto}</p>
          </div>
        ) : null}

        {requiereRecuperacion ? (
          <div className="space-y-3 rounded-xl border border-gray-200 p-3">
            <p className="text-sm font-medium italic text-gray-800">
              Ingreso del tiempo para la recuperación del tiempo solicitado
            </p>
            {tramos.map((tramo, index) => (
              <div key={`rec-${index}`} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                <div>
                  <label className={labelClass} htmlFor={`rec-fecha-${index}`}>Fecha</label>
                  <input
                    id={`rec-fecha-${index}`}
                    type="date"
                    className={inputClass.replace("appearance-none pr-10", "")}
                    value={tramo.fecha}
                    min={minFecha}
                    required
                    disabled={saving}
                    onChange={(e) => {
                      void onFechaRecuperacion(index, e.target.value);
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`rec-ini-${index}`}>Hora desde</label>
                  <HoraMilitarSelect
                    id={`rec-ini-${index}`}
                    name={`hora_ini_rec_${index}`}
                    aria-label={`Hora desde recuperación ${index + 1}`}
                    className={inputClass}
                    value={tramo.hora_ini}
                    opciones={OPCIONES_HORA_AUSENTISMO}
                    required
                    disabled={saving}
                    onChange={(hora_ini) => actualizarTramo(index, { hora_ini })}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor={`rec-fin-${index}`}>Hora hasta</label>
                  <HoraMilitarSelect
                    id={`rec-fin-${index}`}
                    name={`hora_fin_rec_${index}`}
                    aria-label={`Hora hasta recuperación ${index + 1}`}
                    className={inputClass}
                    value={tramo.hora_fin}
                    opciones={OPCIONES_HORA_AUSENTISMO}
                    required
                    disabled={saving}
                    onChange={(hora_fin) => actualizarTramo(index, { hora_fin })}
                  />
                </div>
                <button
                  type="button"
                  className="mb-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  aria-label="Eliminar tramo de recuperación"
                  disabled={saving || tramos.length === 1}
                  onClick={() =>
                    setTramos((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl brand-bg brand-bg-hover px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={saving}
              onClick={() => setTramos((prev) => [...prev, { ...TRAMO_VACIO }])}
            >
              <Plus size={16} />
              Agregar tramo
            </button>
          </div>
        ) : null}

        {pideAdjunto ? (
          <div>
            <label className={labelClass}>
              Soporte (imagen o PDF, máx. 5 MB) <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              name="archivo_soporte"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,image/*,application/pdf"
              className={inputClass.replace("appearance-none pr-10", "")}
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              required
            />
          </div>
        ) : null}

        <OptimizedTextarea
          label="Describe el motivo del permiso"
          labelClassName={labelClass}
          className={textareaClass}
          rows={4}
          value={formData.descripcionMotivo}
          onValueChange={(val) => setFormData({ ...formData, descripcionMotivo: val })}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || (pideAdjunto && !archivo)}
            className="px-5 py-2.5 brand-bg brand-bg-hover text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-80 disabled:cursor-wait flex items-center justify-center gap-2 min-w-[120px]"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Enviando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </form>
    </>
  );
}
