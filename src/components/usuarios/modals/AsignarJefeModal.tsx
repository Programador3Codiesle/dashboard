'use client';
import Modal from "../../shared/ui/Modal";
import { useState } from "react";
import { AsignarJefeModalProps } from "@/modules/usuarios/types";


export default function AsignarJefeModal({ open, usuario, onClose, onSave, jefesDisponibles }: AsignarJefeModalProps) {
    const [selectedJefe, setSelectedJefe] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedJefe !== null) {
            onSave(selectedJefe);
            setSelectedJefe(null);
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={`Asignar Jefe - ${usuario?.nombre}`} width="500px">
            <form onSubmit={handleSubmit}>
                <p style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}>
                    Selecciona el jefe inmediato para este usuario:
                </p>

                <div style={{ marginBottom: "20px", maxHeight: "350px", overflowY: "auto" }}>
                    {jefesDisponibles.map((jefe) => (
                        <label
                            key={jefe.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "12px",
                                marginBottom: "10px",
                                border: "2px solid",
                                borderColor: selectedJefe === jefe.id ? "#f59e0b" : "#ddd",
                                borderRadius: "8px",
                                cursor: "pointer",
                                backgroundColor: selectedJefe === jefe.id ? "#fef3c7" : "#fff",
                                transition: "all 0.2s"
                            }}
                        >
                            <input
                                type="radio"
                                name="jefe"
                                checked={selectedJefe === jefe.id}
                                onChange={() => setSelectedJefe(jefe.id)}
                                style={{
                                    marginRight: "12px",
                                    width: "18px",
                                    height: "18px",
                                    cursor: "pointer"
                                }}
                            />
                            <div>
                                <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "2px" }}>
                                    {jefe.nombre}
                                </div>
                                <div style={{ fontSize: "12px", color: "#666" }}>
                                    {jefe.cargo}
                                </div>
                            </div>
                        </label>
                    ))}
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
                        disabled={selectedJefe === null}
                        style={{
                            padding: "8px 16px",
                            background: selectedJefe === null ? "#ccc" : "#f59e0b",
                            color: "#fff",
                            borderRadius: "6px",
                            border: "none",
                            cursor: selectedJefe === null ? "not-allowed" : "pointer",
                            fontWeight: "500",
                            opacity: selectedJefe === null ? 0.6 : 1
                        }}
                    >
                        Asignar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
