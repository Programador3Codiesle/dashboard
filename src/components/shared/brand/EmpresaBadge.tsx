"use client";

import { useAuth } from "@/core/auth/hooks/useAuth";
import { EMPRESAS } from "@/utils/constants";

export function EmpresaBadge({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  const empresa = user?.empresa != null ? EMPRESAS.find((item) => item.id === user.empresa) : null;

  if (!empresa) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm sm:px-3 sm:text-xs ${className}`}
      style={{ backgroundColor: empresa.color }}
    >
      {empresa.nombre}
    </span>
  );
}
