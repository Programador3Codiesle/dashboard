'use client';
import Modal from "../../shared/ui/Modal";
import { AgregarSedesModalProps } from "@/modules/usuarios/types";
import { useState } from "react";

export default function AgregarSedesModal({ open, usuario, onClose, onSave, sedesDisponibles }: AgregarSedesModalProps) {
    const [selectedSedes, setSelectedSedes] = useState<string[]>([]);

    const toggleSede = (sede: string) => {
        setSelectedSedes(prev =>
            prev.includes(sede)
                ? prev.filter(s => s !== sede)
                : [...prev, sede]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(selectedSedes);
        setSelectedSedes([]);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title={`Agregar Sedes - ${usuario?.nombre}`} width="500px">
            <form onSubmit={handleSubmit}>
                <p style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}>
                    Selecciona las sedes a las que tendrá acceso este usuario:
                </p>

                <div style={{ marginBottom: "20px", maxHeight: "300px", overflowY: "auto" }}>
                    {sedesDisponibles.map((sede) => (
                        <label
                            key={sede}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "10px",
                                marginBottom: "8px",
                                border: "1px solid #ddd",
                                borderRadius: "6px",
                                cursor: "pointer",
                                backgroundColor: selectedSedes.includes(sede) ? "#fef3c7" : "#fff",
                                transition: "all 0.2s"
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selectedSedes.includes(sede)}
                                onChange={() => toggleSede(sede)}
                                style={{
                                    marginRight: "10px",
                                    width: "18px",
                                    height: "18px",
                                    cursor: "pointer"
                                }}
                            />
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>{sede}</span>
                        </label>
                    ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <span style={{ fontSize: "14px", color: "#666" }}>
                        Seleccionadas: <strong>{selectedSedes.length}</strong>
                    </span>
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
