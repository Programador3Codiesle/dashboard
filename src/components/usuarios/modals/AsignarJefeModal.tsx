`use client`;
import Modal from "../../shared/ui/Modal";
import { useState } from "react";
import { AsignarJefeModalProps } from "@/modules/usuarios/types";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/shared/ui/ConfirmModal";

export default function AsignarJefeModal({ open, usuario, onClose, onAsignar, onEliminar, jefesDisponibles, jefesUsuario }: AsignarJefeModalProps) {
    const [selectedJefe, setSelectedJefe] = useState<string | null>(null);
    const [jefeAEliminar, setJefeAEliminar] = useState<string | null>(null);

    // Filtrar jefes disponibles que no están ya asignados
    const jefesDisponiblesParaAsignar = jefesDisponibles.filter(
        jefe => !jefesUsuario.some(j => j.id === jefe.id)
    );

    const handleAsignar = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedJefe !== null) {
            onAsignar(selectedJefe);
            setSelectedJefe(null);
        }
    };

    const handleOpenEliminar = (jefeId: string) => {
        setJefeAEliminar(jefeId);
    };

    const handleConfirmEliminar = () => {
        if (jefeAEliminar) {
            onEliminar(jefeAEliminar);
        }
        setJefeAEliminar(null);
    };

    const handleCancelEliminar = () => {
        setJefeAEliminar(null);
    };

    return (
        <>
        <Modal open={open} onClose={onClose} title={`Gestionar Jefes - ${usuario?.nombre}`} width="600px">
            <div>
                {/* Jefes actuales del usuario */}
                {jefesUsuario.length > 0 && (
                    <div style={{ marginBottom: "25px" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
                            Jefes asignados:
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {jefesUsuario.map((jefe) => (
                                <div
                                    key={jefe.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "12px",
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        backgroundColor: "#f9fafb"
                                    }}
                                >
                                    <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                        {jefe.nombre}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEliminar(jefe.id.toString())}
                                        style={{
                                            padding: "6px 12px",
                                            background: "#fee2e2",
                                            color: "#b91c1c",
                                            borderRadius: "9999px",
                                            border: "none",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "12px",
                                            fontWeight: "500"
                                        }}
                                    >
                                        <Trash2 size={14} />
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Formulario para asignar nuevo jefe */}
                {jefesDisponiblesParaAsignar.length > 0 && (
                    <form onSubmit={handleAsignar}>
                        <p style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}>
                            Selecciona un jefe para asignar:
                        </p>

                        <div style={{ marginBottom: "20px", maxHeight: "300px", overflowY: "auto" }}>
                            {jefesDisponiblesParaAsignar.map((jefe) => (
                                <label
                                    key={jefe.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "12px",
                                        marginBottom: "10px",
                                        border: "2px solid",
                                        borderColor: selectedJefe === jefe.id.toString() ? "#f59e0b" : "#ddd",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        backgroundColor: selectedJefe === jefe.id.toString() ? "#fef3c7" : "#fff",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="jefe"
                                        checked={selectedJefe === jefe.id.toString()}
                                        onChange={() => setSelectedJefe(jefe.id.toString())}
                                        style={{
                                            marginRight: "12px",
                                            width: "18px",
                                            height: "18px",
                                            cursor: "pointer"
                                        }}
                                    />
                                    <div style={{ fontSize: "14px", fontWeight: "600" }}>
                                        {jefe.nombre}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {jefesDisponiblesParaAsignar.length === 0 && (
                            <p style={{ padding: "15px", backgroundColor: "#f3f4f6", borderRadius: "8px", color: "#666", fontSize: "14px" }}>
                                Todos los jefes disponibles ya están asignados.
                            </p>
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
                                Cerrar
                            </button>
                            {jefesDisponiblesParaAsignar.length > 0 && (
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
                            )}
                        </div>
                    </form>
                )}

                {jefesDisponiblesParaAsignar.length === 0 && jefesUsuario.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                        <p>No hay jefes disponibles para asignar.</p>
                    </div>
                )}
            </div>
        </Modal>

        <ConfirmModal
            open={!!jefeAEliminar}
            onConfirm={handleConfirmEliminar}
            onCancel={handleCancelEliminar}
            title="Eliminar jefe"
            message="¿Estás seguro de que deseas eliminar este jefe del usuario?"
            variant="danger"
        />
        </>
    );
}
