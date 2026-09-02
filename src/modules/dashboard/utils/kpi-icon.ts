import type { LucideIcon } from "lucide-react";
import {
  Award,
  CircleCheck,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Gauge,
  Headset,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Timer,
  Warehouse,
  Wrench,
} from "lucide-react";

const KPI_ICON_RULES: Array<{ test: (key: string) => boolean; icon: LucideIcon }> =
  [
    {
      test: (k) =>
        k.includes("nps") &&
        (k.includes("colmotores") || k.includes("gm") || k.includes("pac")),
      icon: Award,
    },
    { test: (k) => k.includes("nps"), icon: Gauge },
    { test: (k) => k.includes("inventario"), icon: Warehouse },
    { test: (k) => k.includes("repuesto") || k.includes("rpto"), icon: Package },
    { test: (k) => k.includes("m.o") || k.includes("mano"), icon: Wrench },
    { test: (k) => /(^|\s)tot(\s|$)/.test(k), icon: ClipboardList },
    { test: (k) => k.includes("hora"), icon: Clock },
    { test: (k) => k.includes("finaliz"), icon: CircleCheck },
    { test: (k) => k.includes("proceso"), icon: Timer },
    { test: (k) => k.includes("pendiente"), icon: Clock },
    { test: (k) => k.includes("presupuesto"), icon: CircleDollarSign },
    { test: (k) => k.includes("cumplimiento"), icon: Gauge },
    { test: (k) => k.includes("estado"), icon: Headset },
    {
      test: (k) =>
        k.includes("vendido") ||
        k.includes("venta") ||
        k.includes("postventa") ||
        k.includes("revenue"),
      icon: ShoppingCart,
    },
  ];

export function resolveDashboardKpiIcon(label: string): LucideIcon {
  const key = label.toLowerCase();
  return KPI_ICON_RULES.find((rule) => rule.test(key))?.icon ?? LayoutDashboard;
}
