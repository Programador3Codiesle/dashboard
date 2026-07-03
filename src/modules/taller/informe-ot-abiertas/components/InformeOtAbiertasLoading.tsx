"use client";

import { Loader2 } from "lucide-react";

interface InformeOtAbiertasLoadingProps {
  message?: string;
  compact?: boolean;
}

export function InformeOtAbiertasLoading({
  message = "Cargando informe...",
  compact = false,
}: InformeOtAbiertasLoadingProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 text-gray-500 ${
        compact ? "py-8" : "py-16"
      }`}
    >
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function InformeOtAbiertasLoadingOverlay({
  message = "Actualizando...",
}: {
  message?: string;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
      <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-md text-gray-600 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        {message}
      </div>
    </div>
  );
}
