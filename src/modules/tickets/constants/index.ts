export const PERFILES_QUE_VEN_TODOS_LOS_TICKETS = ["1", "20"] as const;
export const PERFILES_QUE_REASIGNAN_TICKETS = ["20", "2"] as const;

export function puedeVerTodosLosTickets(perfil: unknown): boolean {
  return perfil === "1" || perfil === "20";
}

export function puedeReasignarTickets(perfil: unknown): boolean {
  return perfil === "20" || perfil === "2";
}

export const TICKETS_ROUTES = {
  root: "/dashboard/tickets",
  activos: "/dashboard/tickets/activos",
  finalizados: "/dashboard/tickets/finalizados",
  mis: "/dashboard/tickets/mis-tickets",
} as const;

export const TICKETS_COPY = {
  title: "Tickets de Soporte",
  subtitle: "Gestiona y da seguimiento a tus solicitudes de soporte.",
  nuevoTicket: "Nuevo Ticket",
} as const;

export const TICKETS_TAB_ITEMS = [
  {
    id: "activos",
    name: "Activos",
    href: TICKETS_ROUTES.activos,
    requiresVerTodos: true,
  },
  {
    id: "finalizados",
    name: "Finalizados",
    href: TICKETS_ROUTES.finalizados,
    requiresVerTodos: true,
  },
  {
    id: "mis",
    name: "Mis Tickets",
    href: TICKETS_ROUTES.mis,
    requiresVerTodos: false,
  },
] as const;

export const TICKETS_TIPOS_SOPORTE = [
  "Insumos de Impresora(Toner)",
  "Hardware",
  "Software",
  "CRM Comercial",
  "CRM PosVenta",
  "CRM DMS",
  "DMS",
] as const;

export const TICKETS_PRIORIDADES = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
] as const;

export const empresasDisponibles = [
  { id: "1", nombre: "Codiesel", logo: "🚗" },
  { id: "2", nombre: "Dieselco", logo: "🔧" },
  { id: "3", nombre: "Mitsubishi", logo: "⚡" },
  { id: "4", nombre: "BYD", logo: "🔋" },
];

export const encargadosDisponibles = [
  { id: "1110602826", nombre: "Cristian Camilo Tunjano Diaz" },
  { id: "1102368016", nombre: "Edwin Manuel Ramirez Tami" },
  { id: "1098625558", nombre: "Zuly Nathalia Ramirez Burgos" },
  { id: "1095944273", nombre: "Cristhian Alberto Sanchez Murillo" },
];

export const sedesTicketsDisponibles = [
  "Giron",
  "Cucuta",
  "Barrancabermeja",
  "Bucaramanga",
];

export const COMPANY_STYLES: Record<string, string> = {
  Codiesel: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
  Dieselco: "bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/10",
  Mitsubishi: "bg-red-50 text-red-700 border-red-200 ring-red-500/10",
  BYD: "bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/10",
  default: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/10",
};

export const TICKETS_CARD_EN_PROCESO_CLASS =
  "group relative bg-gradient-to-br from-[var(--color-primary-light)] via-white to-[var(--color-primary-light)] p-6 rounded-2xl shadow-lg border-2 border-[var(--color-primary)] hover:shadow-xl hover:border-[var(--color-primary-hover)] transition-all duration-300 flex flex-col justify-between overflow-hidden";

export const TICKETS_CARD_ACTIVO_CLASS =
  "group relative bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-6 rounded-2xl shadow-md border-2 border-blue-300 hover:shadow-lg hover:border-blue-400 transition-all duration-300 flex flex-col justify-between overflow-hidden";

export const TICKETS_BADGE_EN_PROCESO_CLASS =
  "px-3 py-1.5 rounded-full text-xs font-bold brand-bg-gradient text-white shadow-md flex items-center gap-1.5";

export const TICKETS_BADGE_ACTIVO_CLASS =
  "px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex items-center gap-1.5";
