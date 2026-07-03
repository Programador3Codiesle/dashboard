"use client";

import { EV_DETAIL_CELL, EV_DETAIL_LABEL, EV_DETAIL_VALUE } from "../utils/entrada-vehiculo.styles";

interface VehiculoDetailFieldProps {
  label: string;
  value: React.ReactNode;
  colSpan?: number;
}

export function VehiculoDetailField({ label, value, colSpan }: VehiculoDetailFieldProps) {
  return (
    <td className={EV_DETAIL_CELL} colSpan={colSpan}>
      <span className={EV_DETAIL_LABEL}>{label}: </span>
      <span className={EV_DETAIL_VALUE}>{value}</span>
    </td>
  );
}
