interface DashboardFechaBadgeProps {
  fecha: string;
  diaFestivo: number;
}

export function DashboardFechaBadge({
  fecha,
  diaFestivo,
}: DashboardFechaBadgeProps) {
  return (
    <div className="flex justify-end">
      <div className="inline-flex items-center gap-2 rounded-xl brand-bg px-4 py-2 text-white shadow-md text-sm">
        <span className="font-semibold">Fecha:</span>
        <span className="text-base font-semibold">{fecha}</span>
        {diaFestivo === 1 && (
          <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-[0.7rem] font-medium">
            Día festivo
          </span>
        )}
      </div>
    </div>
  );
}
