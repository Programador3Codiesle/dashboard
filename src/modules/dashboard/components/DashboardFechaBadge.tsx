import { CalendarDays } from "lucide-react";

interface DashboardFechaBadgeProps {
  fecha: string;
  diaFestivo: number;
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

export function DashboardFechaBadge({
  fecha,
  diaFestivo,
}: DashboardFechaBadgeProps) {
  return (
    <div className="flex justify-end">
      <div className="inline-flex max-w-full flex-wrap items-center gap-2.5 rounded-full border brand-border-active bg-white px-3 py-2 text-sm text-gray-800 shadow-md brand-card-elevated sm:px-3.5">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full brand-bg-light">
          <CalendarDays size={15} className="brand-text" strokeWidth={2.25} />
        </span>
        <span className="font-medium tracking-tight">
          <span className="sr-only">Fecha: </span>
          {formatFechaEs(fecha)}
        </span>
        {diaFestivo === 1 && (
          <span className="rounded-full brand-bg px-2 py-0.5 text-[0.65rem] font-semibold text-white">
            Día festivo
          </span>
        )}
      </div>
    </div>
  );
}
