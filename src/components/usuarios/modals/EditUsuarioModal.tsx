'use client';
import Modal from "../../shared/ui/Modal";
import { EditUsuarioModalProps } from "@/modules/usuarios/types";
import { useState, useEffect } from "react";

export default function EditUsuarioModal({ open, usuario, onClose, onSave, perfilesDisponibles, perfilActual }: EditUsuarioModalProps) {
    const [selectedPerfil, setSelectedPerfil] = useState<string>("");

    useEffect(() => {
        if (open && perfilActual) {
            setSelectedPerfil(perfilActual.id);
        } else if (open) {
            setSelectedPerfil("");
        }
    }, [open, perfilActual]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPerfil) {
            onSave(selectedPerfil);
            onClose();
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={`Editar Perfil - ${usuario?.nombre}`} width="500px">
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "10px", fontSize: "14px", fontWeight: "500" }}>
                        Perfil actual:
                    </label>
                    {perfilActual ? (
                        <div style={{
                            padding: "12px",
                            backgroundColor: "#f0fdf4",
                            border: "1px solid #86efac",
                            borderRadius: "6px",
                            marginBottom: "15px"
                        }}>
                            <span style={{ fontSize: "14px", fontWeight: "600", color: "#059669" }}>
                                {perfilActual.nombre}
                            </span>
                        </div>
                    ) : (
                        <div style={{
                            padding: "12px",
                            backgroundColor: "#f3f4f6",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            marginBottom: "15px"
                        }}>
                            <span style={{ fontSize: "14px", color: "#6b7280" }}>
                                Sin perfil asignado
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "10px", fontSize: "14px", fontWeight: "500" }}>
                        Seleccionar nuevo perfil:
                    </label>
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {perfilesDisponibles.map((perfil) => (
                            <label
                                key={perfil.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "12px",
                                    marginBottom: "8px",
                                    border: "2px solid",
                                    borderColor: selectedPerfil === perfil.id ? "#f59e0b" : "#ddd",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    backgroundColor: selectedPerfil === perfil.id ? "#fef3c7" : "#fff",
                                    transition: "all 0.2s"
                                }}
                            >
                                <input
                                    type="radio"
                                    name="perfil"
                                    checked={selectedPerfil === perfil.id}
                                    onChange={() => setSelectedPerfil(perfil.id)}
                                    style={{
                                        marginRight: "12px",
                                        width: "18px",
                                        height: "18px",
                                        cursor: "pointer"
                                    }}
                                />
                                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                    {perfil.nombre}
                                </span>
                            </label>
                        ))}
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
                        disabled={!selectedPerfil}
                        style={{
                            padding: "8px 16px",
                            background: !selectedPerfil ? "#ccc" : "#f59e0b",
                            color: "#fff",
                            borderRadius: "6px",
                            border: "none",
                            cursor: !selectedPerfil ? "not-allowed" : "pointer",
                            fontWeight: "500",
                            opacity: !selectedPerfil ? 0.6 : 1
                        }}
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
