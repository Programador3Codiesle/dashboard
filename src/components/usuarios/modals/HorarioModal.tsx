'use client';
import Modal from "../../shared/ui/Modal";
import { useState, useEffect } from "react";
import { HorarioData, HorarioModalProps } from "@/modules/usuarios/types";
import { SEDES_DISPONIBLES } from "@/modules/usuarios/constants";

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

    useEffect(() => {
        if (horarioActual && open) {
            setHorario({
                sede: horarioActual.sede || "",
                hora_ent_sem_am: horarioActual.hora_ent_sem_am || "07:00",
                hora_sal_sem_am: horarioActual.hora_sal_sem_am || "12:00",
                hora_ent_sem_pm: horarioActual.hora_ent_sem_pm || "14:00",
                hora_sal_sem_pm: horarioActual.hora_sal_sem_pm || "20:00",
                hora_ent_am_viernes: horarioActual.hora_ent_am_viernes || "07:00",
                hora_sal_am_viernes: horarioActual.hora_sal_am_viernes || "12:00",
                hora_ent_pm_viernes: horarioActual.hora_ent_pm_viernes || "15:00",
                hora_sal_pm_viernes: horarioActual.hora_sal_pm_viernes || "22:00",
                hora_ent_viernes_pm: horarioActual.hora_ent_viernes_pm || horarioActual.hora_ent_pm_viernes || "15:00",
                hora_sal_viernes: horarioActual.hora_sal_viernes || horarioActual.hora_sal_pm_viernes || "22:00",
                hora_ent_fds: horarioActual.hora_ent_fds || "08:30",
                hora_sal_fds: horarioActual.hora_sal_fds || "15:00"
            });
        }
    }, [horarioActual, open]);

    const handleChange = (field: keyof HorarioData, value: string) => {
        setHorario(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(horario);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title={`Configurar Horario - ${usuario?.nombre}`} width="700px">
            <form onSubmit={handleSubmit}>
                {/* Sede */}
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                        Sede <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <select
                        value={horario.sede}
                        onChange={(e) => handleChange("sede", e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            fontSize: "14px",
                            backgroundColor: "#fff",
                            cursor: "pointer"
                        }}
                    >
                        <option value="">Seleccione una sede</option>
                        {SEDES_DISPONIBLES.map((sede) => (
                            <option key={sede} value={sede}>
                                {sede}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Semana AM */}
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#374151" }}>
                        Semana - Turno Mañana
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Entrada
                            </label>
                            <input
                                type="time"
                                value={horario.hora_ent_sem_am}
                                onChange={(e) => handleChange("hora_ent_sem_am", e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Salida
                            </label>
                            <input
                                type="time"
                                value={horario.hora_sal_sem_am}
                                onChange={(e) => handleChange("hora_sal_sem_am", e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Semana PM */}
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#374151" }}>
                        Semana - Turno Tarde
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Entrada
                            </label>
                            <input
                                type="time"
                                value={horario.hora_ent_sem_pm}
                                onChange={(e) => handleChange("hora_ent_sem_pm", e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Salida
                            </label>
                            <input
                                type="time"
                                value={horario.hora_sal_sem_pm}
                                onChange={(e) => handleChange("hora_sal_sem_pm", e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Viernes AM */}
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#fef3c7", borderRadius: "8px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#374151" }}>
                        Viernes - Turno Mañana
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Entrada
                            </label>
                            <input
                                type="time"
                                value={horario.hora_ent_am_viernes}
                                onChange={(e) => handleChange("hora_ent_am_viernes", e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Salida
                            </label>
                            <input
                                type="time"
                                value={horario.hora_sal_am_viernes}
                                onChange={(e) => handleChange("hora_sal_am_viernes", e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Viernes PM (hora_ent_viernes_pm y hora_sal_viernes) */}
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#fef3c7", borderRadius: "8px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#374151" }}>
                        Viernes - Turno Tarde
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Entrada
                            </label>
                            <input
                                type="time"
                                value={horario.hora_ent_viernes_pm || "15:00"}
                                onChange={(e) => handleChange("hora_ent_viernes_pm", e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Salida
                            </label>
                            <input
                                type="time"
                                value={horario.hora_sal_viernes || "22:00"}
                                onChange={(e) => handleChange("hora_sal_viernes", e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Fin de Semana */}
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#dbeafe", borderRadius: "8px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#374151" }}>
                        Fin de Semana (Sábado y Domingo)
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Entrada
                            </label>
                            <input
                                type="time"
                                value={horario.hora_ent_fds}
                                onChange={(e) => handleChange("hora_ent_fds", e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", color: "#666" }}>
                                Salida
                            </label>
                            <input
                                type="time"
                                value={horario.hora_sal_fds}
                                onChange={(e) => handleChange("hora_sal_fds", e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    fontSize: "14px"
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: "8px 16px",
                            background: "#ddd",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        style={{
                            padding: "8px 16px",
                            background: "#f59e0b",
                            color: "#fff",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "500"
                        }}
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
