"use client";

import type { ReactNode } from "react";
import { EV_DETAIL_LABEL, EV_DETAIL_VALUE } from "../utils/entrada-vehiculo.styles";

interface VehiculoDetailFieldProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function VehiculoDetailField({
  label,
  value,
  className = "",
}: VehiculoDetailFieldProps) {
  return (
    <div className={`min-w-0 py-1 ${className}`}>
      <span className={EV_DETAIL_LABEL}>{label}: </span>
      <span className={`${EV_DETAIL_VALUE} break-words`}>{value}</span>
    </div>
  );
}
