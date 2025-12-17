'use client';

import React, { createContext, useCallback, useContext, useState } from "react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    setToasts((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), message, variant },
    ]);
    // Auto-remove después de unos segundos
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4000);
  }, []);

  const showSuccess = (message: string) => addToast(message, "success");
  const showError = (message: string) => addToast(message, "error");
  const showInfo = (message: string) => addToast(message, "info");

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      {/* Contenedor visual de toasts */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[280px] max-w-sm rounded-2xl px-4 py-3 shadow-xl border text-sm flex items-start gap-3
              backdrop-blur bg-white/95
              ${toast.variant === "success" ? "border-emerald-200" : ""}
              ${toast.variant === "error" ? "border-red-200" : ""}
              ${toast.variant === "info" ? "border-blue-200" : ""}`}
          >
            <span
              className={`mt-0.5 text-xs font-semibold uppercase tracking-wide
                ${toast.variant === "success" ? "text-emerald-600" : ""}
                ${toast.variant === "error" ? "text-red-600" : ""}
                ${toast.variant === "info" ? "text-blue-600" : ""}`}
            >
              {toast.variant === "success"
                ? "Éxito"
                : toast.variant === "error"
                ? "Error"
                : "Info"}
            </span>
            <span className="text-gray-800 text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return ctx;
};


