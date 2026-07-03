import { LayoutDashboard, User, Ticket, Settings, FileText, FileBarChart2, Receipt, Wrench } from "lucide-react";

export type EmpresaId = 1 | 2 | 3 | 4;

export interface EmpresaConfig {
  id: EmpresaId;
  nombre: string;
  color: string;
  colorHover?: string;
}

export const EMPRESAS: EmpresaConfig[] = [
  { id: 1, nombre: "Codiesel", color: "#f59e0b", colorHover: "#d97706" },
  { id: 2, nombre: "Dieselco", color: "#4CB8AA", colorHover: "#3da89a" },
  { id: 3, nombre: "Mitsubishi", color: "#ED0000", colorHover: "#cc0000" },
  { id: 4, nombre: "BYD", color: "#4F9EDD", colorHover: "#3d8bcc" },
];

export const ROUTES = [
  { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/usuarios", name: "Usuarios", icon: User },
  { path: "/dashboard/tickets", name: "Tickets", icon: Ticket },
  { path: "/dashboard/administracion", name: "Administración", icon: Settings },
  { path: "/dashboard/nomina", name: "Nomina", icon: Receipt },
  { path: "/dashboard/cotizar", name: "Cotizar", icon: FileText },
  { path: "/dashboard/informes", name: "Informes", icon: FileBarChart2 },
  { path: "/dashboard/taller", name: "Taller", icon: Wrench },
];

export const MENU_ID_BY_ROUTE: Record<string, number> = {
  "/dashboard/usuarios": 1,
  "/dashboard/tickets": 9,
  "/dashboard/administracion": 11,
  "/dashboard/nomina": 3,
  "/dashboard/cotizar": 45,
  "/dashboard/informes": 5,
  "/dashboard/taller": 4,
};

/** IDs de submenú MPVI (tabla menús legacy, id_menu padre = 4 Taller) */
export const MPVI_SUBMENU_IDS = {
  admin: 151,
  tecnicos: 180,
  jefeTaller: 181,
  contact: 182,
} as const;

/** Submenú Entrada de vehículo (Taller, id_menu = 4) */
export const ENTRADA_VEHICULO_SUBMENU_ID = 55;

/** Submenú Estado taller (Taller, id_menu = 4) */
export const ESTADO_TALLER_SUBMENU_ID = 40;

/** Submenú Informe órdenes taller abiertas (Taller, id_menu = 4) */
export const INFORME_OT_ABIERTAS_SUBMENU_ID = 41;

// Colores para tarjetas del Dashboard (opcional)
export const DASHBOARD_CARD_COLORS = {
  users: 'bg-indigo-500',
  transactions: 'bg-green-500',
  tickets: 'bg-yellow-500',
};

// Mensajes globales (pueden usarse para alerts, modals, tooltips)
export const MESSAGES = {
  errorFetch: 'Ocurrió un error al cargar los datos. Intenta nuevamente.',
  successAction: 'La acción se completó correctamente.',
};

// Formatos de fecha y moneda
export const FORMAT = {
  currency: (amount: number) => `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
};
