'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

const AUTO_CIERRE_MS = 3000;

const TOAST_TONE: Record<
  ToastVariant,
  {
    title: string;
    iconWrap: string;
    icon: React.ReactNode;
  }
> = {
  info: {
    title: 'Información',
    iconWrap:
      'bg-[color-mix(in_srgb,var(--color-info)_16%,white)] text-[var(--color-info)]',
    icon: <Info size={36} strokeWidth={2} />,
  },
  success: {
    title: 'Éxito',
    iconWrap: 'bg-[var(--color-success-soft)] text-[var(--color-success)]',
    icon: <CircleCheck size={36} strokeWidth={2} />,
  },
  error: {
    title: 'Error',
    iconWrap: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
    icon: <CircleAlert size={36} strokeWidth={2} />,
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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastToastRef = useRef<{ key: string; ts: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = toasts[0] ?? null;

  const cerrar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const key = `${variant}:${message}`;
    const now = Date.now();
    if (
      lastToastRef.current &&
      lastToastRef.current.key === key &&
      now - lastToastRef.current.ts < 500
    ) {
      return;
    }
    lastToastRef.current = { key, ts: now };
    setToasts((prev) => [
      ...prev,
      { id: now + Math.random(), message, variant },
    ]);
  }, []);

  const showSuccess = useCallback(
    (message: string) => addToast(message, 'success'),
    [addToast],
  );
  const showError = useCallback(
    (message: string) => addToast(message, 'error'),
    [addToast],
  );
  const showInfo = useCallback(
    (message: string) => addToast(message, 'info'),
    [addToast],
  );

  useEffect(() => {
    if (!current || current.variant === 'error') return;
    const id = current.id;
    const timeoutId = setTimeout(() => cerrar(id), AUTO_CIERRE_MS);
    return () => clearTimeout(timeoutId);
  }, [current, cerrar]);

  useEffect(() => {
    if (!current) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    buttonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') cerrar(current.id);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previo;
      document.removeEventListener('keydown', onKey);
    };
  }, [current, cerrar]);

  const value = useMemo(
    () => ({ showSuccess, showError, showInfo }),
    [showSuccess, showError, showInfo],
  );

  const tone = current ? TOAST_TONE[current.variant] : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {current && tone ? (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrar(current.id);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="app-aviso-titulo"
            aria-describedby="app-aviso-mensaje"
            className="w-full max-w-md rounded-3xl bg-white px-8 py-8 text-center shadow-[0_24px_80px_-24px_rgba(15,23,42,0.55)]"
          >
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${tone.iconWrap}`}
              aria-hidden="true"
            >
              {tone.icon}
            </div>
            <h2
              id="app-aviso-titulo"
              className="mt-5 text-xl font-semibold text-gray-900"
            >
              {tone.title}
            </h2>
            <p
              id="app-aviso-mensaje"
              className="mt-2 text-base leading-relaxed text-gray-600"
            >
              {current.message}
            </p>
            <button
              ref={buttonRef}
              type="button"
              className="brand-bg brand-bg-hover mt-6 inline-flex min-w-36 items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
              onClick={() => cerrar(current.id)}
            >
              Entendido
            </button>
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return ctx;
};
