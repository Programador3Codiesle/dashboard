"use client";

import { Loader2 } from "lucide-react";

interface EntradaVehiculoLoadingProps {
  message: string;
  compact?: boolean;
}

export function EntradaVehiculoLoading({
  message,
  compact = false,
}: EntradaVehiculoLoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-gray-600 ${
        compact ? "gap-2 py-6" : "gap-3 py-12"
      }`}
    >
      <Loader2
        className={`animate-spin brand-text ${compact ? "h-5 w-5" : "h-9 w-9"}`}
        strokeWidth={2}
      />
      <p className={`font-medium text-gray-600 ${compact ? "text-xs" : "text-sm"}`}>
        {message}
      </p>
    </div>
  );
}

interface EntradaVehiculoLoadingOverlayProps {
  message: string;
}

export function EntradaVehiculoLoadingOverlay({
  message,
}: EntradaVehiculoLoadingOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[2px]">
      <EntradaVehiculoLoading message={message} compact />
    </div>
  );
}
