import Modal from "./Modal";

interface ConfirmModalProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    /** Cerrar sin acción (clic fuera, X). Si no se define, usa onCancel. */
    onDismiss?: () => void;
    title?: string;
    message?: string;
    variant?: 'danger' | 'success';
    confirmLabel?: string;
    cancelLabel?: string;
}

export default function ConfirmModal({
    open,
    onConfirm,
    onCancel,
    onDismiss,
    title = "Confirmar acción",
    message = "¿Estás seguro?",
    variant = 'danger',
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
}: ConfirmModalProps) {
    const handleDismiss = onDismiss ?? onCancel;

    const confirmButtonStyle = {
        padding: "8px 14px",
        background: variant === 'success' ? "#22c55e" : "#d32f2f",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        transition: "all 0.2s ease",
        fontWeight: "500"
    };

    return (
        <Modal open={open} onClose={handleDismiss} title={title} width="420px">
            <p style={{ marginBottom: "20px" }}>{message}</p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
                {onDismiss != null && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        style={{
                            padding: "8px 14px",
                            background: "#f3f4f6",
                            borderRadius: "6px",
                            border: "1px solid #e5e7eb",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            fontWeight: "500",
                            color: "#374151",
                        }}
                    >
                        Cerrar
                    </button>
                )}
                <button
                    type="button"
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
                    {cancelLabel}
                </button>

                <button
                    type="button"
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
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}
