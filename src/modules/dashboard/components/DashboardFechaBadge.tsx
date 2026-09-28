"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { currentYearMonthValue, parseYearMonth } from "../constants";

interface DashboardFechaBadgeProps {
  fecha: string;
  diaFestivo: number;
  /** Si se envía, la pastilla abre el selector de mes y oculta el filtro aparte. */
  selectedMonth?: string;
  onMonthChange?: (value: string) => void;
}

function parseFechaLocal(fecha: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha.trim());
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  const parsed = new Date(fecha);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function esHoy(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function formatFechaEs(fecha: string): string {
  const date = parseFechaLocal(fecha);
  if (!date) return fecha;

  const cuerpo = date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (esHoy(date)) {
    return `Hoy, ${cuerpo}`;
  }

  const conSemana = date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return conSemana.charAt(0).toUpperCase() + conSemana.slice(1);
}

function formatMesSeleccionado(value: string): string {
  const { mes, ano } = parseYearMonth(value);
  if (!mes || !ano) return value;
  const texto = new Date(ano, mes - 1, 1).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function opcionesDeMes(etiquetaMesActual: string): { value: string; label: string }[] {
  const hoy = new Date();
  const actual = currentYearMonthValue(hoy);
  const opciones: { value: string; label: string }[] = [];
  for (let i = 0; i < 24; i++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const value = currentYearMonthValue(fecha);
    opciones.push({
      value,
      label: value === actual ? etiquetaMesActual : formatMesSeleccionado(value),
    });
  }
  return opciones;
}

export function DashboardFechaBadge({
  fecha,
  diaFestivo,
  selectedMonth,
  onMonthChange,
}: DashboardFechaBadgeProps) {
  const esSelector = typeof onMonthChange === "function";
  const esMesActual =
    !selectedMonth || selectedMonth === currentYearMonthValue();
  const texto =
    esSelector && selectedMonth && !esMesActual
      ? formatMesSeleccionado(selectedMonth)
      : formatFechaEs(fecha);
  const opciones = esSelector ? opcionesDeMes(formatFechaEs(fecha)) : [];
  const valor = selectedMonth ?? currentYearMonthValue();
  const listboxId = useId();
  const raizRef = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    if (!abierto) return;

    const cerrar = (event: MouseEvent) => {
      if (!raizRef.current?.contains(event.target as Node)) {
        setAbierto(false);
      }
    };
    const tecla = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAbierto(false);
    };

    document.addEventListener("mousedown", cerrar);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", cerrar);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    document.getElementById(`${listboxId}-${valor}`)?.scrollIntoView({
      block: "nearest",
    });
  }, [abierto, listboxId, valor]);

  return (
    <div ref={raizRef} className="relative flex justify-end">
      <div className="inline-flex max-w-full flex-wrap items-center gap-2.5 rounded-full border brand-border-active bg-white px-3 py-2 text-sm text-gray-800 shadow-md brand-card-elevated sm:px-3.5">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full brand-bg-light">
          <CalendarDays size={15} className="brand-text" strokeWidth={2.25} />
        </span>
        {esSelector ? (
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={abierto}
            aria-controls={listboxId}
            className="inline-flex items-center gap-1.5 rounded-full bg-transparent font-medium tracking-tight text-gray-800 brand-focus-ring"
            onClick={() => setAbierto((prev) => !prev)}
          >
            {texto}
            <ChevronDown
              size={14}
              className={`text-gray-500 motion-safe:transition-transform ${abierto ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        ) : (
          <span className="font-medium tracking-tight">
            <span className="sr-only">Fecha: </span>
            {texto}
          </span>
        )}
        {diaFestivo === 1 && (
          <span className="rounded-full brand-bg px-2 py-0.5 text-[0.65rem] font-semibold text-white">
            Día festivo
          </span>
        )}
      </div>

      {esSelector && abierto && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Mes"
          className="absolute top-[calc(100%+0.4rem)] right-0 z-30 max-h-52 w-72 overflow-y-auto overscroll-contain rounded-2xl border border-gray-100 bg-white py-1.5 shadow-lg"
        >
          {opciones.map((opcion) => {
            const activa = opcion.value === valor;
            return (
              <li key={opcion.value} role="presentation">
                <button
                  id={`${listboxId}-${opcion.value}`}
                  type="button"
                  role="option"
                  aria-selected={activa}
                  className={`mx-1.5 flex w-[calc(100%-0.75rem)] whitespace-nowrap rounded-xl px-3 py-2 text-left text-sm brand-focus-ring ${
                    activa
                      ? "brand-bg-light font-semibold brand-text"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    onMonthChange(opcion.value);
                    setAbierto(false);
                  }}
                >
                  {opcion.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
