'use client';
import React, { useCallback } from 'react';
import { Portal } from "./Portal";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string;
}

/**
 * Componente Modal memoizado
 * Evita re-renders innecesarios cuando no está abierto
 */
export default React.memo(function Modal({ open, onClose, title, children, width = "450px" }: ModalProps) {
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    const handleContentClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

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
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian las props relevantes
  return (
    prevProps.open === nextProps.open &&
    prevProps.title === nextProps.title &&
    prevProps.width === nextProps.width &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.children === nextProps.children
  );
});
