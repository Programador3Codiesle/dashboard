import Modal from "./Modal";

interface ConfirmModalProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
    variant?: 'danger' | 'success'; // danger = rojo, success = verde
}

export default function ConfirmModal({
    open,
    onConfirm,
    onCancel,
    title = "Confirmar acción",
    message = "¿Estás seguro?",
    variant = 'danger'
}: ConfirmModalProps) {
    const confirmButtonStyle = {
        padding: "8px 14px",
        background: variant === 'success' ? "#22c55e" : "#d32f2f", // Verde para success, rojo para danger
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontWeight: "500"
    };

    return (
        <Modal open={open} onClose={onCancel} title={title} width="420px">
            <p style={{ marginBottom: "20px" }}>{message}</p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                    onClick={onCancel}
                    style={{
                        padding: "8px 14px",
                        background: "#ddd",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontWeight: "500"
                    }}
                >
                    Cancelar
                </button>

                <button
                    onClick={onConfirm}
                    style={confirmButtonStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.9";
                        e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    Confirmar
                </button>
            </div>
        </Modal>
    );
}
