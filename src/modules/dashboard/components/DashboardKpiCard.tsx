import type { LucideIcon } from "lucide-react";
import { createElement, type ReactNode } from "react";
import { DASHBOARD_STYLES } from "../constants";
import { resolveDashboardKpiIcon } from "../utils/kpi-icon";

interface DashboardKpiCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  footer?: ReactNode;
  icon?: LucideIcon;
}

function KpiIconBadge({ icon }: { icon: LucideIcon }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full brand-bg-light brand-text"
      aria-hidden
    >
      {createElement(icon, { size: 18, strokeWidth: 2 })}
    </span>
  );
}

export function DashboardKpiCard({
  label,
  value,
  hint,
  footer,
  icon,
}: DashboardKpiCardProps) {
  return (
    <div className={DASHBOARD_STYLES.kpiCard}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium text-gray-500">
          {label}
        </p>
        <KpiIconBadge icon={icon ?? resolveDashboardKpiIcon(label)} />
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {value}
        </p>
        {hint != null && hint !== "" && (
          <span className="text-sm font-medium text-gray-400">{hint}</span>
        )}
      </div>
      {footer != null && footer !== "" && (
        <div className="mt-3 text-xs text-gray-500">{footer}</div>
      )}
    </div>
  );
}

