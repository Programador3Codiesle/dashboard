'use client';
import Modal from "../../shared/ui/Modal";
import { useState } from "react";
import { HorarioData, HorarioModalProps } from "@/modules/usuarios/types";



export default function HorarioModal({ open, usuario, onClose, onSave, diasSemana }: HorarioModalProps) {
    const [horario, setHorario] = useState<HorarioData>({
        dias: [],
        horaInicio: "08:00",
        horaFin: "17:00"
    });

    const toggleDia = (dia: string) => {
        setHorario(prev => ({
            ...prev,
            dias: prev.dias.includes(dia)
                ? prev.dias.filter(d => d !== dia)
                : [...prev.dias, dia]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (horario.dias.length > 0) {
            onSave(horario);
            setHorario({ dias: [], horaInicio: "08:00", horaFin: "17:00" });
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={`Configurar Horario - ${usuario?.nombre}`} width="550px">
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "10px", fontSize: "14px", fontWeight: "600" }}>
                        Días laborales:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                        {diasSemana.map((dia) => (
                            <label
                                key={dia}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "10px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    backgroundColor: horario.dias.includes(dia) ? "#fef3c7" : "#fff",
                                    transition: "all 0.2s"
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={horario.dias.includes(dia)}
                                    onChange={() => toggleDia(dia)}
                                    style={{
                                        marginRight: "8px",
                                        width: "16px",
                                        height: "16px",
                                        cursor: "pointer"
                                    }}
                                />
                                <span style={{ fontSize: "14px", fontWeight: "500" }}>{dia}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                            Hora de inicio
                        </label>
                        <input
                            type="time"
                            value={horario.horaInicio}
                            onChange={(e) => setHorario({ ...horario, horaInicio: e.target.value })}
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
                        <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                            Hora de fin
                        </label>
                        <input
                            type="time"
                            value={horario.horaFin}
                            onChange={(e) => setHorario({ ...horario, horaFin: e.target.value })}
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

                {horario.dias.length > 0 && (
                    <div style={{
                        padding: "12px",
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #86efac",
                        borderRadius: "6px",
                        marginBottom: "15px"
                    }}>
                        <p style={{ fontSize: "13px", color: "#166534", margin: 0 }}>
                            <strong>Resumen:</strong> {horario.dias.join(", ")} de {horario.horaInicio} a {horario.horaFin}
                        </p>
                    </div>
                )}

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
                        disabled={horario.dias.length === 0}
                        style={{
                            padding: "8px 16px",
                            background: horario.dias.length === 0 ? "#ccc" : "#f59e0b",
                            color: "#fff",
                            borderRadius: "6px",
                            border: "none",
                            cursor: horario.dias.length === 0 ? "not-allowed" : "pointer",
                            fontWeight: "500",
                            opacity: horario.dias.length === 0 ? 0.6 : 1
                        }}
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
