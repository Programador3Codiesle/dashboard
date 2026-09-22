'use client';
import Modal from "@/components/shared/ui/Modal";
import { useMemo, useState, useEffect } from "react";
import { HorarioData, HorarioModalProps, IHorarioApi } from "@/modules/usuarios/types";
import { SEDES_DISPONIBLES } from "@/modules/usuarios/constants";
import { EmpleadoSearchCombobox } from "@/modules/informes/shared/components/EmpleadoSearchCombobox";
import { useEmpleadosInformesCombo } from "@/modules/informes/shared/hooks/useEmpleadosInformesCombo";
import { useHorarioUsuario } from "@/modules/usuarios/hooks/useHorario";

function horarioDesdeApi(origen: IHorarioApi): HorarioData {
    return {
        sede: origen.sede || "",
        hora_ent_sem_am: origen.hora_ent_sem_am || "07:00",
        hora_sal_sem_am: origen.hora_sal_sem_am || "12:00",
        hora_ent_sem_pm: origen.hora_ent_sem_pm || "14:00",
        hora_sal_sem_pm: origen.hora_sal_sem_pm || "20:00",
        hora_ent_am_viernes: origen.hora_ent_am_viernes || "07:00",
        hora_sal_am_viernes: origen.hora_sal_am_viernes || "12:00",
        hora_ent_pm_viernes: origen.hora_ent_pm_viernes || "15:00",
        hora_sal_pm_viernes: origen.hora_sal_pm_viernes || "22:00",
        hora_ent_viernes_pm: origen.hora_ent_viernes_pm || origen.hora_ent_pm_viernes || "15:00",
        hora_sal_viernes: origen.hora_sal_viernes || origen.hora_sal_pm_viernes || "22:00",
        hora_ent_fds: origen.hora_ent_fds || "08:30",
        hora_sal_fds: origen.hora_sal_fds || "15:00",
    };
}

const timeInputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none brand-focus-ring";

function TimePair({
  entrada,
  salida,
  onEntrada,
  onSalida,
  required = true,
}: {
  entrada: string;
  salida: string;
  onEntrada: (value: string) => void;
  onSalida: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="app-form-grid-2">
      <div>
        <label className="mb-1.5 block text-xs text-gray-500">Entrada</label>
        <input
          type="time"
          value={entrada}
          onChange={(e) => onEntrada(e.target.value)}
          required={required}
          className={timeInputClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs text-gray-500">Salida</label>
        <input
          type="time"
          value={salida}
          onChange={(e) => onSalida(e.target.value)}
          required={required}
          className={timeInputClass}
        />
      </div>
    </div>
  );
}

export default function HorarioModal({ open, usuario, onClose, onSave, horarioActual }: HorarioModalProps) {
    const [horario, setHorario] = useState<HorarioData>({
        sede: "",
        hora_ent_sem_am: "07:00",
        hora_sal_sem_am: "12:00",
        hora_ent_sem_pm: "14:00",
        hora_sal_sem_pm: "20:00",
        hora_ent_am_viernes: "07:00",
        hora_sal_am_viernes: "12:00",
        hora_ent_pm_viernes: "15:00",
        hora_sal_pm_viernes: "22:00",
        hora_ent_viernes_pm: "15:00",
        hora_sal_viernes: "22:00",
        hora_ent_fds: "08:30",
        hora_sal_fds: "15:00"
    });
    const [nitOrigen, setNitOrigen] = useState("");
    const [avisoCopia, setAvisoCopia] = useState<string | null>(null);

    const { data: empleados = [], isLoading: cargandoEmpleados } = useEmpleadosInformesCombo();
    const {
        horario: horarioOrigen,
        isLoading: cargandoHorarioOrigen,
        isFetched: horarioOrigenConsultado,
    } = useHorarioUsuario(nitOrigen || undefined, open && !!nitOrigen);

    const opcionesEmpleado = useMemo(() => {
        const nitActual = usuario?.nit ? String(usuario.nit) : "";
        return empleados
            .filter((empleado) => empleado.nit !== nitActual)
            .sort((a, b) => a.nombres.localeCompare(b.nombres, "es"));
    }, [empleados, usuario?.nit]);

    const sedes = useMemo(() => {
        if (horario.sede && !SEDES_DISPONIBLES.includes(horario.sede)) {
            return [horario.sede, ...SEDES_DISPONIBLES];
        }
        return SEDES_DISPONIBLES;
    }, [horario.sede]);

    useEffect(() => {
        if (horarioActual && open && !nitOrigen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHorario(horarioDesdeApi(horarioActual));
        }
    }, [horarioActual, open, nitOrigen]);

    useEffect(() => {
        if (!nitOrigen || !horarioOrigenConsultado || cargandoHorarioOrigen) return;
        if (!horarioOrigen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- el horario llega de la consulta
            setAvisoCopia("Ese empleado no tiene horario asignado.");
            return;
        }
        setAvisoCopia(null);
        setHorario(horarioDesdeApi(horarioOrigen));
    }, [nitOrigen, horarioOrigen, horarioOrigenConsultado, cargandoHorarioOrigen]);

    const handleChange = (field: keyof HorarioData, value: string) => {
        setHorario(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(horario);
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Configurar Horario - ${usuario?.nombre}`}
            width="700px"
            overflowClassName="overflow-visible"
        >
            <form onSubmit={handleSubmit} className="flex max-h-[75vh] flex-col">
                <div className="mb-4 shrink-0">
                    <label
                        htmlFor="copiar-horario-empleado"
                        className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                        Copiar horario de
                    </label>
                    <EmpleadoSearchCombobox
                        id="copiar-horario-empleado"
                        empleados={opcionesEmpleado}
                        value={nitOrigen}
                        onChange={(nit) => {
                            setNitOrigen(nit);
                            setAvisoCopia(null);
                            if (!nit && horarioActual) {
                                setHorario(horarioDesdeApi(horarioActual));
                            }
                        }}
                        cargando={cargandoEmpleados}
                        emptyOptionLabel="No copiar horario"
                        placeholder="Buscar por nombre..."
                    />
                    <p className="mt-1.5 text-xs text-gray-500">
                        Elija un empleado para traer su sede y sus horas. Después puede ajustarlas y guardarlas para esta persona.
                    </p>
                    {cargandoHorarioOrigen ? (
                        <p className="mt-1 text-xs text-gray-500">Cargando horario...</p>
                    ) : null}
                    {avisoCopia ? (
                        <p className="mt-1 text-xs text-red-500" role="status">
                            {avisoCopia}
                        </p>
                    ) : null}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="mb-5">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Sede <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={horario.sede}
                        onChange={(e) => handleChange("sede", e.target.value)}
                        required
                        className={timeInputClass}
                    >
                        <option value="">Seleccione una sede</option>
                        {sedes.map((sede) => (
                            <option key={sede} value={sede}>
                                {sede}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-5 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                        Semana - Turno Mañana
                    </h4>
                    <TimePair
                        entrada={horario.hora_ent_sem_am}
                        salida={horario.hora_sal_sem_am}
                        onEntrada={(v) => handleChange("hora_ent_sem_am", v)}
                        onSalida={(v) => handleChange("hora_sal_sem_am", v)}
                    />
                </div>

                <div className="mb-5 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                        Semana - Turno Tarde
                    </h4>
                    <TimePair
                        entrada={horario.hora_ent_sem_pm}
                        salida={horario.hora_sal_sem_pm}
                        onEntrada={(v) => handleChange("hora_ent_sem_pm", v)}
                        onSalida={(v) => handleChange("hora_sal_sem_pm", v)}
                    />
                </div>

                <div className="mb-5 rounded-lg brand-bg-light p-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                        Viernes - Turno Mañana
                    </h4>
                    <TimePair
                        entrada={horario.hora_ent_am_viernes}
                        salida={horario.hora_sal_am_viernes}
                        onEntrada={(v) => handleChange("hora_ent_am_viernes", v)}
                        onSalida={(v) => handleChange("hora_sal_am_viernes", v)}
                    />
                </div>

                <div className="mb-5 rounded-lg brand-bg-light p-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                        Viernes - Turno Tarde
                    </h4>
                    <TimePair
                        entrada={horario.hora_ent_viernes_pm || "15:00"}
                        salida={horario.hora_sal_viernes || "22:00"}
                        onEntrada={(v) => handleChange("hora_ent_viernes_pm", v)}
                        onSalida={(v) => handleChange("hora_sal_viernes", v)}
                        required={false}
                    />
                </div>

                <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4">
                    <h4 className="mb-3 text-sm font-semibold text-gray-700">
                        Fin de Semana (Sábado y Domingo)
                    </h4>
                    <TimePair
                        entrada={horario.hora_ent_fds}
                        salida={horario.hora_sal_fds}
                        onEntrada={(v) => handleChange("hora_ent_fds", v)}
                        onSalida={(v) => handleChange("hora_sal_fds", v)}
                    />
                </div>
                </div>

                <div className="mt-4 flex shrink-0 flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="w-full sm:w-auto rounded-lg px-4 py-2 text-sm font-medium text-white brand-bg brand-bg-hover transition-colors"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
