"use client";

import React from "react";
import {
  BookOpen,
  CalendarCheck,
  DollarSign,
  Edit,
  PlusSquare,
} from "lucide-react";
import type { OrdenTallerAbierta } from "../types/estado-taller.types";

interface EstadoTallerRowActionsProps {
  orden: OrdenTallerAbierta;
  onAgregarEvento: (numero: number) => void;
  onVerHistorial: (numero: number) => void;
  onValoresEstimados: (numero: number) => void;
  onFacturaMes: (numero: number) => void;
  onSacyr: (numero: number, ids: number[]) => void;
}

function EstadoTallerRowActionsComponent({
  orden,
  onAgregarEvento,
  onVerHistorial,
  onValoresEstimados,
  onFacturaMes,
  onSacyr,
}: EstadoTallerRowActionsProps) {
  return (
    <div className="flex flex-wrap gap-1 min-w-[140px]">
      <button
        type="button"
        title="Agregar evento"
        onClick={() => onAgregarEvento(orden.numero)}
        className="p-1.5 rounded border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
      >
        <PlusSquare className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Ver historial"
        onClick={() => onVerHistorial(orden.numero)}
        className="p-1.5 rounded border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
      >
        <BookOpen className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="Cargar valores estimados (cliente)"
        onClick={() => onValoresEstimados(orden.numero)}
        className="p-1.5 rounded border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
      >
        <DollarSign className="w-4 h-4" />
      </button>
      <button
        type="button"
        title="¿Factura mes actual?"
        onClick={() => onFacturaMes(orden.numero)}
        className="p-1.5 rounded border border-amber-500 text-amber-600 hover:bg-amber-50"
      >
        <CalendarCheck className="w-4 h-4" />
      </button>
      {orden.cotizacionesSacyr.length > 0 && (
        <button
          type="button"
          title="Cotizaciones Sacyr"
          onClick={() => onSacyr(orden.numero, orden.cotizacionesSacyr)}
          className="p-1.5 rounded border border-amber-500 text-amber-600 hover:bg-amber-50"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export const EstadoTallerRowActions = React.memo(EstadoTallerRowActionsComponent);
