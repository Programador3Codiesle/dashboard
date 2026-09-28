'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, useMemo, useRef } from "react";
import { CircleAlert, CircleCheck, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

const TOAST_TONE: Record<
  ToastVariant,
  { title: string; rail: string; shell: string; badge: string; label: string; icon: React.ReactNode }
> = {
  info: {
    title: "Información",
    rail: "bg-[color-mix(in_srgb,var(--color-info)_40%,#0c4a6e)]",
    shell:
      "border-[color-mix(in_srgb,var(--color-info)_55%,#0369a1)] bg-[color-mix(in_srgb,var(--color-info)_18%,white)]",
    badge: "bg-[color-mix(in_srgb,var(--color-info)_28%,white)] text-[color-mix(in_srgb,var(--color-info)_35%,#0c4a6e)]",
    label: "text-[color-mix(in_srgb,var(--color-info)_30%,#0c4a6e)]",
    icon: <Info size={18} strokeWidth={2.25} />,
  },
  success: {
    title: "Éxito",
    rail: "bg-[var(--color-success)]",
    shell: "border-[color-mix(in_srgb,var(--color-success)_35%,white)] bg-[var(--color-success-soft)]",
    badge: "bg-white text-[var(--color-success)]",
    label: "text-[var(--color-success-hover)]",
    icon: <CircleCheck size={18} strokeWidth={2.25} />,
  },
  error: {
    title: "Error",
    rail: "bg-[var(--color-danger)]",
    shell: "border-[color-mix(in_srgb,var(--color-danger)_28%,white)] bg-[var(--color-danger-soft)]",
    badge: "bg-white text-[var(--color-danger)]",
    label: "text-[var(--color-danger)]",
    icon: <CircleAlert size={18} strokeWidth={2.25} />,
  },
};

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
  const lastToastRef = useRef<{ key: string; ts: number } | null>(null);
  const timeoutIdsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    return () => {
      for (const id of timeoutIdsRef.current) {
        clearTimeout(id);
      }
      timeoutIdsRef.current = [];
    };
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const key = `${variant}:${message}`;
    const now = Date.now();

    // Evita duplicados inmediatos (por StrictMode u otros dobles disparos)
    if (lastToastRef.current && lastToastRef.current.key === key && now - lastToastRef.current.ts < 500) {
      return;
    }

    lastToastRef.current = { key, ts: now };

    setToasts((prev) => [
      ...prev,
      { id: now + Math.random(), message, variant },
    ]);
    // Auto-remove después de unos segundos (ligeramente más largo para facilitar la lectura)
    const timeoutId = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 7000);
    timeoutIdsRef.current.push(timeoutId);
  }, []);

  const showSuccess = useCallback((message: string) => addToast(message, "success"), [addToast]);
  const showError = useCallback((message: string) => addToast(message, "error"), [addToast]);
  const showInfo = useCallback((message: string) => addToast(message, "info"), [addToast]);

  const value = useMemo(() => ({ showSuccess, showError, showInfo }), [showSuccess, showError, showInfo]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Contenedor visual de toasts */}
      <div
        className="pointer-events-none fixed top-4 right-4 z-9999 flex w-[min(100vw-2rem,26rem)] flex-col items-stretch gap-3"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const tone = TOAST_TONE[toast.variant];
          return (
            <div
              key={toast.id}
              role={toast.variant === "error" ? "alert" : "status"}
              className={`pointer-events-auto flex overflow-hidden rounded-2xl border shadow-[0_16px_40px_-16px_rgba(15,23,42,0.45)] ${tone.shell}`}
            >
              <span className={`w-1.5 shrink-0 ${tone.rail}`} aria-hidden="true" />
              <div className="flex min-w-0 items-start gap-3 px-4 py-3.5">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tone.badge}`}
                  aria-hidden="true"
                >
                  {tone.icon}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className={`text-xs font-semibold tracking-wide uppercase ${tone.label}`}>
                    {tone.title}
                  </p>
                  <p className="mt-0.5 text-sm font-medium leading-snug text-gray-900">
                    {toast.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
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


