'use client';
import { Portal } from "./Portal";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string;
}

export default function Modal({ open, onClose, title, children, width = "450px" }: ModalProps) {
    if (!open) return null;

    return (
        <Portal>
            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9998
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        background: "#fff",
                        borderRadius: "10px",
                        padding: "20px",
                        width,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.15)"
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {title && <h3 style={{ marginBottom: "15px" }}>{title}</h3>}
                    {children}
                </div>
            </div>
        </Portal>
    );
}
