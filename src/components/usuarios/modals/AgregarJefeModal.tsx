'use client';
import Modal from "../../shared/ui/Modal";
import { AgregarJefeModalProps } from "@/modules/usuarios/types";
import { useState, useEffect } from "react";
import { useJefesGeneral, useUsuariosJefes } from "@/modules/usuarios/hooks/useJefesGeneral";
import { useUsuarioActions } from "@/modules/usuarios/hooks/useUsuarioActions";
import { Loader2 } from "lucide-react";

export default function AgregarJefeModal({ open, onClose }: AgregarJefeModalProps) {
    const { jefes, isLoading: loadingJefes, refetch: refetchJefes } = useJefesGeneral();
    const { usuarios, isLoading: loadingUsuarios } = useUsuariosJefes();
    const { crearJefeGeneral } = useUsuarioActions();

    const [selectedNit, setSelectedNit] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Recargar el listado de jefes cada vez que se abre el modal
    useEffect(() => {
        if (open) {
            refetchJefes();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Limpiar el formulario cuando se cierra el modal
    useEffect(() => {
        if (!open) {
            setSelectedNit("");
            setEmail("");
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNit || !email) return;

        setIsSubmitting(true);
        try {
            const success = await crearJefeGeneral(selectedNit, email);
            if (success) {
                setSelectedNit("");
                setEmail("");
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal open={open} onClose={onClose} title="Gestión de Jefes" width="650px">
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px" }}>
                {/* Lista de jefes actuales */}
                <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px" }}>Jefes actuales</h3>
                    <div style={{ maxHeight: "320px", overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                        {loadingJefes ? (
                            <div style={{ padding: "16px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
                                Cargando jefes...
                            </div>
                        ) : jefes.length === 0 ? (
                            <div style={{ padding: "16px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
                                No hay jefes registrados.
                            </div>
                        ) : (
                            jefes.map((jefe) => (
                                <div
                                    key={jefe.id}
                                    style={{
                                        padding: "10px 12px",
                                        borderBottom: "1px solid #e5e7eb",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                    }}
                                >
                                    <span style={{ fontSize: "14px", fontWeight: 600 }}>{jefe.nombre}</span>
                                    <span style={{ fontSize: "12px", color: "#6b7280" }}>NIT: {jefe.nit}</span>
                                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{jefe.email}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Formulario para crear nuevo jefe */}
                <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px" }}>Registrar nuevo jefe</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: 500 }}>
                                Seleccionar usuario
                            </label>
                            <select
                                value={selectedNit}
                                onChange={(e) => setSelectedNit(e.target.value)}
                                disabled={loadingUsuarios || usuarios.length === 0}
                                style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: "6px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "14px",
                                }}
                            >
                                <option value="">Seleccione un usuario</option>
                                {usuarios.map((u) => (
                                    <option key={u.id} value={u.id.toString()}>
                                        {u.nombre}
                                    </option>
                                ))}
                            </select>
                            {loadingUsuarios && (
                                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                                    Cargando usuarios...
                                </p>
                            )}
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontSize: "13px", fontWeight: 500 }}>
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                }}
                                placeholder="correo@empresa.com"
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: "8px 16px",
                                    background: "#e5e7eb",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontWeight: 500,
                                }}
                            >
                                Cerrar
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedNit || !email || isSubmitting}
                                style={{
                                    padding: "8px 16px",
                                    background: !selectedNit || !email || isSubmitting ? "#d1d5db" : "#f59e0b",
                                    color: "#fff",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: !selectedNit || !email || isSubmitting ? "not-allowed" : "pointer",
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                Registrar jefe
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
}
