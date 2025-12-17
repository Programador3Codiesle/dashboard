'use client';
import Modal from "../../shared/ui/Modal";
import { AgregarSedesModalProps } from "@/modules/usuarios/types";
import { Check, X } from "lucide-react";
import ConfirmModal from "@/components/shared/ui/ConfirmModal";
import { useState } from "react";

export default function AgregarSedesModal({ open, usuario, onClose, onAsignar, onEliminar, sedesDisponibles, sedesUsuario }: AgregarSedesModalProps) {
    const [sedeAEliminar, setSedeAEliminar] = useState<string | null>(null);
    
    // Obtener IDs de sedes del usuario
    const sedesUsuarioIds = sedesUsuario.map(s => s.id);

    const handleToggleSede = (sedeId: string) => {
        const isActiva = sedesUsuarioIds.includes(sedeId);
        if (isActiva) {
            setSedeAEliminar(sedeId);
        } else {
            onAsignar(sedeId);
        }
    };

    const handleConfirmEliminar = () => {
        if (sedeAEliminar) {
            onEliminar(sedeAEliminar);
            setSedeAEliminar(null);
        }
    };

    const handleCancelEliminar = () => {
        setSedeAEliminar(null);
    };

    return (
        <Modal open={open} onClose={onClose} title={`Gestionar Sedes - ${usuario?.nombre}`} width="600px">
            <div>
                <p style={{ marginBottom: "20px", fontSize: "14px", color: "#666" }}>
                    Haz clic en una sede para activarla o desactivarla:
                </p>

                <div style={{ marginBottom: "20px", maxHeight: "400px", overflowY: "auto" }}>
                    {sedesDisponibles.map((sede) => {
                        const isActiva = sedesUsuarioIds.includes(sede.id.toString());
                        return (
                            <div
                                key={sede.id}
                                onClick={() => handleToggleSede(sede.id.toString())}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "14px",
                                    marginBottom: "10px",
                                    border: `2px solid ${isActiva ? "#10b981" : "#ddd"}`,
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    backgroundColor: isActiva ? "#f0fdf4" : "#fff",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        backgroundColor: isActiva ? "#10b981" : "#e5e7eb",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#fff",
                                        fontSize: "12px",
                                        fontWeight: "600"
                                    }}>
                                        {isActiva ? <Check size={14} /> : <X size={14} />}
                                    </div>
                                    <span style={{ fontSize: "14px", fontWeight: "500", color: isActiva ? "#059669" : "#374151" }}>
                                        {sede.nombre}
                                    </span>
                                </div>
                                <span style={{
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    backgroundColor: isActiva ? "#d1fae5" : "#f3f4f6",
                                    color: isActiva ? "#065f46" : "#6b7280"
                                }}>
                                    {isActiva ? "Activa" : "Inactiva"}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    marginBottom: "15px",
                    padding: "12px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px"
                }}>
                    <span style={{ fontSize: "14px", color: "#666" }}>
                        Sedes activas: <strong style={{ color: "#059669" }}>{sedesUsuarioIds.length}</strong> / {sedesDisponibles.length}
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
                        Cerrar
                    </button>
                </div>
            </div>

            <ConfirmModal
                open={!!sedeAEliminar}
                onConfirm={handleConfirmEliminar}
                onCancel={handleCancelEliminar}
                title="Eliminar sede"
                message="¿Estás seguro de que deseas eliminar esta sede del usuario?"
                variant="danger"
            />
        </Modal>
    );
}
