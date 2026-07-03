'use client';
import React, { useCallback } from 'react';
import { Portal } from "./Portal";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: string;
    maxWidthClassName?: string;
    contentClassName?: string;
}

/**
 * Componente Modal memoizado
 * Evita re-renders innecesarios cuando no está abierto
 */
export default React.memo(function Modal({
  open,
  onClose,
  title,
  children,
  width = "450px",
  maxWidthClassName = "max-w-[95vw] sm:max-w-[88vw] md:max-w-[760px] 2xl:max-w-[980px]",
  contentClassName = "",
}: ModalProps) {
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
                className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[1px] flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={onClose}
            >
                <div
                    className={`w-full ${maxWidthClassName} rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl max-h-[88vh] overflow-y-auto ${contentClassName}`}
                    style={{ width, backgroundColor: "#ffffff" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {title && (
                      <h3
                        className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900"
                        style={{ backgroundColor: "#ffffff" }}
                      >
                        {title}
                      </h3>
                    )}
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
    prevProps.contentClassName === nextProps.contentClassName &&
    prevProps.maxWidthClassName === nextProps.maxWidthClassName &&
    prevProps.onClose === nextProps.onClose &&
    prevProps.children === nextProps.children
  );
});
