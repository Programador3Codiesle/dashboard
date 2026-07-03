"use client";

import { Loader2 } from "lucide-react";

interface EstadoTallerLoadingProps {
  message: string;
  compact?: boolean;
}

export function EstadoTallerLoading({
  message,
  compact = false,
}: EstadoTallerLoadingProps) {
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

export function EstadoTallerLoadingOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[2px]">
      <EstadoTallerLoading message={message} compact />
    </div>
  );
}
