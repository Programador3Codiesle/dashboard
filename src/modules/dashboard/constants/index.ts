/**
 * Perfiles con acceso al home de dashboard.
 * Debe coincidir con el ruteo de Backend `domain/dashboard.constants.ts`
 * (1/32 admin, 20 y 33 jefe taller, 22/23 gerencia, 24 técnicos, 28 compras,
 * 31 agente CC, 34 asesor, 46 mto).
 */
export const ALLOWED_DASHBOARD_PROFILES: number[] = [
  1, 20, 22, 23, 24, 28, 31, 32, 33, 34, 46,
];

export function isDashboardAllowedPerfil(
  perfil: string | number | undefined,
): boolean {
  if (perfil == null || perfil === "") return false;
  const n = typeof perfil === "string" ? Number(perfil) : perfil;
  return Number.isFinite(n) && ALLOWED_DASHBOARD_PROFILES.includes(n);
}

export const DASHBOARD_COPY = {
  login: "Inicia sesión para ver el dashboard.",
  error: "No se pudo cargar el dashboard. Intenta de nuevo.",
  loadingEmpresa: "Cargando dashboard para la empresa seleccionada...",
  loading: "Cargando información del dashboard...",
  loadingMes: "Cargando datos del mes seleccionado...",
  mesLabel: "Mes:",
} as const;

export const DASHBOARD_STYLES = {
  monthInput:
    "rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 bg-white focus:outline-none brand-focus-ring",
  spinner:
    "w-10 h-10 border-4 border-(--color-primary) border-t-transparent rounded-full animate-spin",
  overlay:
    "absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-start justify-center pt-50 md:pt-80 rounded-lg overflow-hidden",
  barPrimary: "h-full rounded-full brand-bg-gradient",
  kpiCard:
    "bg-white rounded-2xl p-5 shadow-sm border brand-card-surface transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
} as const;

export function currentYearMonthValue(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function parseYearMonth(value: string | undefined): {
  mes?: number;
  ano?: number;
} {
  if (!value) return {};
  const [anoStr, mesStr] = value.split("-");
  const mes = Number(mesStr || 0);
  const ano = Number(anoStr || 0);
  return {
    mes: Number.isFinite(mes) && mes > 0 ? mes : undefined,
    ano: Number.isFinite(ano) && ano > 0 ? ano : undefined,
  };
}
