'use client';
import Modal from "../../shared/ui/Modal";
import { EditUsuarioModalProps } from "@/modules/usuarios/types";
import { useState } from "react";


export default function EditUsuarioModal({ open, usuario, onClose, onSave }: EditUsuarioModalProps) {
    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || '',
        sede: usuario?.sede || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.name === 'sede' ? parseInt(e.target.value) || 0 : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (usuario) {
            onSave({
                ...usuario,
                ...formData
            });
        }
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title="Editar Usuario" width="500px">
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                        Nombre completo
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
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

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "14px", fontWeight: "500" }}>
                        Sede (ID)
                    </label>
                    <input
                        type="number"
                        name="sede"
                        value={formData.sede}
                        onChange={handleChange}
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
